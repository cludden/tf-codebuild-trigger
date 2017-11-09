/**
 * @file index.js
 * @overview lambda function entrypoint
 */
import 'source-map-support/register';
import compact from 'lodash.compact';
import get from 'lodash.get';

import container from './container';

export const ERROR = 'event:error';
export const NOOP = 'event:noop';
export const SUCCESS = 'event:success';

/**
 * Lambda function handler invoked by the lambda runtime
 * @param  {Object}   e    - lambda event
 * @param  {Object}   ctx  - lambda context object
 * @param  {Function} done - lambda callback
 * @return {Promise}
 */
export async function handler(e, ctx, done) {
  // freeze the node process immediately on exit
  // see http://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-using-old-runtime.html
  ctx.callbackWaitsForEmptyEventLoop = false;
  // load modules
  const modules = await container.load({
    codebuild: 'codebuild',
    config: 'config',
    log: 'log',
    sns: 'sns',
  });
  const log = modules.log.child({ req_id: ctx.awsRequestId });
  try {
    const result = await processEvent(e, { ...modules, log });
    log.info({ result }, SUCCESS);
    done(null, result);
  } catch (err) {
    log.error(err, ERROR);
    done(err);
  }
}

/**
 * Extract, parse, and validate github event payloads and start builds for those
 * repositories that have a corresponding codebuild project.
 * @param  {Object}  e                 - lambda event
 * @param  {Object}  modules           - modules
 * @param  {Object}  modules.codebuild - codebuild implementation
 * @param  {Object}  modules.log       - logger implementation
 * @param  {Object}  modules.sns       - sns implementation
 * @return {Promise}
 */
export async function processEvent(e, { codebuild, log, sns }) {
  // extract github event payloads from lambda event
  let payloads = sns.extractPayloads(e, { log });
  if (!payloads.length) {
    return NOOP;
  }
  // fetch a list of codebuild projects that do not exist and use it to filter
  // event payloads
  const names = compact(payloads.map(p => get(p, 'repository.name')));
  if (!names.length) {
    return NOOP;
  }
  const missing = await codebuild.findMissingProjects(names);
  payloads = payloads.filter((p) => {
    const name = get(p, 'repository.name');
    return name && !missing.includes(name);
  });
  if (!payloads.length) {
    return NOOP;
  }
  // transform event payloads into a list build instructions
  const params = codebuild.buildParams(payloads, { log });
  return codebuild.startBuilds(params);
}
