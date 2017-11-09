import { fromCallback } from 'bluebird';
import { expect } from 'chai';
import { before, afterEach, describe, it } from 'mocha';
import sinon from 'sinon';

import { handler, NOOP } from '../../src';
import container from '../../src/container';
import { PARAMETER } from '../../src/codebuild';
import * as sns from '../fixtures/sns';

describe('basic', function () {
  before(async function () {
    const modules = await container.load({
      codebuild: 'codebuild',
      config: 'config',
    });
    Object.assign(this, modules);
    this.sandbox = sinon.sandbox.create();
    this.topicArn = this.config.get('sns.topic_arn');
  });

  afterEach(function () {
    this.sandbox.restore();
  });

  it('should skip invalid messages', async function () {
    const e = sns.event(
      // invalid topic arn
      sns.record('{"foo":"bar"}', { subject: 'release', topicArn: 'test' }),
      // non json payload
      sns.record('{ hello }', { topicArn: this.topicArn }),
      // invalid eventName
      sns.record('{"foo":"bar"}', { subject: 'foo', topicArn: this.topicArn }),
      // no matching buildspec entry
      sns.record('{"action":"labeled","repository":{"name":"foo"}}', { subject: 'pull_request', topicArn: this.topicArn }),
    );
    const spy = this.sandbox.spy(this.codebuild, 'findMissingProjects');
    const result = await fromCallback(done => handler(e, {}, done));
    expect(result).to.equal(NOOP);
    expect(spy.callCount).to.equal(0);
  });

  it('should filter out repos with no corresponding codebuild project', async function () {
    const e = sns.event(sns.record(JSON.stringify({
      action: 'published',
      repository: {
        name: 'foo',
      },
    }), { subject: 'release', topicArn: this.topicArn }));
    const stub = this.sandbox.stub(this.codebuild._client(), 'batchGetProjects').returns({
      promise: sinon.stub().resolves({
        projectsNotFound: ['foo'],
      }),
    });
    const result = await fromCallback(done => handler(e, {}, done));
    expect(result).to.equal(NOOP);
    expect(stub.callCount).to.equal(1);
  });

  it('should start builds using the correct buildspecOverride', async function () {
    const e = sns.event(
      // pull request
      sns.record(JSON.stringify({
        action: 'opened',
        number: 20,
        repository: {
          name: 'foo',
        },
      }), { subject: 'pull_request', topicArn: this.topicArn }),
      // release
      sns.record(JSON.stringify({
        action: 'published',
        release: {
          tag_name: 'v1.0.0',
        },
        repository: {
          name: 'foo',
        },
      }), { subject: 'release', topicArn: this.topicArn }),
    );
    const client = this.codebuild._client();
    this.sandbox.stub(client, 'batchGetProjects').returns({
      promise: sinon.stub().resolves({
        projectsNotFound: [],
      }),
    });
    this.sandbox.stub(client, 'startBuild').returns({
      promise: sinon.stub().resolves({}),
    });
    const result = await fromCallback(done => handler(e, {}, done));
    expect(result).to.deep.equal([{}, {}]);
    expect(client.startBuild.callCount).to.equal(2);
    // verify pull request
    let call = client.startBuild.getCalls().find(c => /^pr/g.test(c.args[0].sourceVersion));
    let params = call.args[0];
    expect(params).to.have.property('buildspecOverride', 'buildspec.pr.yml');
    expect(params).to.have.property('sourceVersion', 'pr/20');
    expect(params).to.have.property('projectName', 'foo');
    expect(params).to.have.property('environmentVariablesOverride')
      .that.is.an('array').with.lengthOf(2);
    expect(params).to.have.nested.property('environmentVariablesOverride.0.name', 'REPOSITORY_NAME');
    expect(params).to.have.nested.property('environmentVariablesOverride.0.value', 'foo');
    expect(params).to.have.nested.property('environmentVariablesOverride.1.name', 'SSH_KEY');
    expect(params).to.have.nested.property('environmentVariablesOverride.1.type', PARAMETER);
    expect(params).to.have.nested.property('environmentVariablesOverride.1.value', this.config.get('parameters.SSH_KEY'));
    // verify release
    call = client.startBuild.getCalls().find(c => /^v/g.test(c.args[0].sourceVersion));
    params = call.args[0]; // eslint-disable-line
    expect(params).to.have.property('buildspecOverride', 'buildspec.release.yml');
    expect(params).to.have.property('sourceVersion', 'v1.0.0');
    expect(params).to.have.property('projectName', 'foo');
    expect(params).to.have.property('environmentVariablesOverride')
      .that.is.an('array').with.lengthOf(2);
    expect(params).to.have.nested.property('environmentVariablesOverride.0.name', 'REPOSITORY_NAME');
    expect(params).to.have.nested.property('environmentVariablesOverride.0.value', 'foo');
    expect(params).to.have.nested.property('environmentVariablesOverride.1.name', 'SSH_KEY');
    expect(params).to.have.nested.property('environmentVariablesOverride.1.type', PARAMETER);
    expect(params).to.have.nested.property('environmentVariablesOverride.1.value', this.config.get('parameters.SSH_KEY'));
  });
});
