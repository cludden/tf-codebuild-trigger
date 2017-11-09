/**
 * @file container.js
 * @overview function di/ioc container
 */
import Container from 'app-container';

import * as codebuild from './codebuild';
import * as config from './config';
import * as log from './log';
import * as sns from './sns';
import * as ssm from './ssm';

const modules = [
  codebuild,
  config,
  log,
  sns,
  ssm,
];

const container = new Container({
  defaults: { singleton: true },
});

modules.forEach(mod => container.register(mod, mod.inject.name, mod.inject));

export default container;
