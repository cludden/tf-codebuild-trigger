import faker from 'faker';

/**
 * Generate an SNS lambda event containing the specified records
 * @param  {...Object} records - sns record
 * @return {Object}
 */
export function event(...records) {
  return {
    Records: records,
  };
}

/**
 * Generate an SNS lambda record
 * @param  {String} message                        - notification message
 * @param  {Object} options                        - options
 * @param  {String} [options.subject='TestInvoke'] - notification subject
 * @param  {String} options.topicArn               - sns topic arn
 * @return {Object}
 */
export function record(message, { subject = 'TestInvoke', topicArn }) {
  return {
    EventVersion: '1.0',
    EventSource: 'aws:sns',
    Sns: {
      SignatureVersion: '1',
      Timestamp: faker.date.past(2).toISOString(),
      MessageId: faker.random.uuid(),
      Message: message,
      Type: 'Notification',
      TopicArn: topicArn || 'arn:aws:sns:us-east-1:123456789:test',
      Subject: subject,
    },
  };
}
