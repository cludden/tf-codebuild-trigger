/**
 * @module log
 * @overview lambda function logger
 */
import { createLogger } from 'bunyan';

import { name, version } from '../package.json';

export const inject = {
  name: 'log',
  require: ['config'],
};

export default function (config) {
  const options = config.get('log');
  return createLogger({ ...options, name, version });
}
