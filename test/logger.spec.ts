/* eslint-disable @typescript-eslint/camelcase */
import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

import Logger from '../src/logger';

chai.use(sinonChai);

const logger = new Logger();

const silent = logger.winstonLogger.transports[0].silent;

describe('logger', () => {
  const sandbox = sinon.createSandbox();

  afterEach(() => {
    sandbox.restore();
    logger.winstonLogger.transports[0].silent = silent;
  });

  beforeEach(() => {
    sandbox.stub(process.stdout, 'write');
    logger.winstonLogger.transports[0].silent = false;
  });

  describe('redactor', () => {
    it('should redact client_secret', () => {
      logger.info('Testing redaction', { obj: { client_secret: 'hello' } });
      expect(process.stdout.write).to.have.been.calledWith(sinon.match('[REDACTED]'));
    });

    it('should be able to redact deeply nested keys', () => {
      logger.info('Testing redaction', { obj: { this: { is: { deep: { client_secret: 'hello' } } } } });
      expect(process.stdout.write).to.have.been.calledWith(sinon.match('[REDACTED]'));
    });

    it('should not redact fields that have not been blacklisted', () => {
      logger.info('Testing redaction', { obj: { hi: 'hello' } });
      expect(process.stdout.write).to.have.been.calledWith(sinon.match('hello'));
    });
  });

  describe('alert', () => {
    it('should append ALERT: to log messages', () => {
      logger.alert('Testing alert', { obj: { hi: 'hello' } });
      expect(process.stdout.write).to.have.been.calledWith(sinon.match('ALERT: Testing alert'));
    });
  });
});
