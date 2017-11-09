import { before } from 'mocha';
import sinon from 'sinon';

import container from '../../src/container';

before(async function () {
  const ssm = await container.load('ssm');
  sinon.stub(ssm, 'getParameters').returns({
    promise: sinon.stub().resolves({
      Parameters: [{
        Value: JSON.stringify({
          github: {
            buildspecs: {
              'buildspec.pr.yml': {
                type: 'object',
                properties: {
                  eventName: {
                    const: 'pull_request',
                  },
                  action: {
                    type: 'string',
                    enum: [
                      'opened',
                      'edited',
                      'reopened',
                    ],
                  },
                },
                required: [
                  'eventName',
                  'action',
                ],
              },
              'buildspec.release.yml': {
                type: 'object',
                properties: {
                  eventName: {
                    const: 'release',
                  },
                  action: {
                    type: 'string',
                    enum: [
                      'published',
                    ],
                  },
                },
                required: [
                  'eventName',
                  'action',
                ],
              },
            },
          },
          log: {
            level: process.env.LOG_LEVEL,
          },
          parameters: {
            SSH_KEY: '/secrets/ops/us-east-1/tf-codebuild-trigger/ssh-key',
          },
        }),
      }, {
        Value: JSON.stringify({
          sns: {
            topic_arn: process.env.SNS_TOPIC_ARN,
          },
        }),
      }],
    }),
  });
});
