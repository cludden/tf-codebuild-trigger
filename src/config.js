/**
 * @module config
 * @overview encrypted configuration provider
 */
import get from 'lodash.get';
import merge from 'lodash.merge';

export const inject = {
  name: 'config',
  require: ['ssm'],
};

export default async function (ssm) {
  // fetch configuration from secure parameter store
  const data = await Promise.race([
    ssm.getParameters({
      Names: process.env.CONFIG_PARAMETER_NAMES.split(','),
      WithDecryption: true,
    }).promise(),
    new Promise(resolve => setTimeout(resolve, 30000)),
  ]);

  // parse configuration and merge together
  const config = data.Parameters.reduce((acc, p) => {
    merge(acc, JSON.parse(p.Value));
    return acc;
  }, {});

  return {
    /**
     * Expose a getter method for retrieiving portions of the decrypted
     * configuration tree
     * @param {String} path - path using dot notation
     */
    get: get.bind(null, config),
  };
}
