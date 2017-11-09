/**
 * @module sns
 * @overview implements functionality related to parsing github events from sns
 */
import Ajv from 'ajv';
import attempt from 'lodash.attempt';
import get from 'lodash.get';

export const inject = {
  name: 'sns',
  require: ['config'],
};

export default function (config) {
  const ajv = new Ajv({
    useDefaults: true,
    coerceTypes: true,
  });

  const eventSourceARN = config.get('sns.topic_arn');

  // compile buildspec validation functions
  let buildspecs = config.get('github.buildspecs', {});
  buildspecs = Object.keys(buildspecs).reduce((acc, spec) => {
    acc[spec] = ajv.compile(buildspecs[spec]);
    return acc;
  }, {});

  /**
   * Extract github events from lambda event
   * @param  {Object}   e           - lambda event
   * @param  {Object}   options     - options
   * @param  {Object}   options.log - logger
   * @return {Object}
   */
  function extractPayloads(e, { log }) {
    return get(e, 'Records', [])
      .reduce((acc, record) => {
        // filter out records that did not originate from the our target input stream
        if (record.EventSource !== 'aws:sns' || record.Sns.TopicArn !== eventSourceARN) {
          log.warn({ record: JSON.stringify(record) }, 'invalid event source');
          return acc;
        }

        // filter out records that can not be parsed
        const parsed = attempt(() => JSON.parse(record.Sns.Message));
        if (parsed instanceof Error) {
          log.warn({ record: JSON.stringify(record) }, 'parse error');
          return acc;
        }
        parsed.eventName = record.Sns.Subject;

        // ensure buildspec match
        const buildspecOverride = matchBuildspec(parsed);
        if (!buildspecOverride) {
          log.warn({ record: JSON.stringify(record) }, 'no buildspec match');
          return acc;
        }
        parsed.buildspecOverride = buildspecOverride;

        acc.push(parsed);
        return acc;
      }, []);
  }

  /**
   * Find the appropriate buildspec based on event schemas
   * @param  {Object} payload - parsed github event payload
   * @return {String}
   */
  function matchBuildspec(payload) {
    return Object.keys(buildspecs).find(spec => buildspecs[spec](payload));
  }

  return {
    extractPayloads,
    matchBuildspec,
  };
}
