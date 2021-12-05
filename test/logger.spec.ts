import Logger from '../src/logger';

const logger = new Logger();

const silent = logger.winstonLogger.transports[0].silent;

describe('logger', () => {
  beforeEach(() => {
    logger.winstonLogger.transports[0].silent = false;
  });

  afterEach(() => {
    jest.restoreAllMocks();
    logger.winstonLogger.transports[0].silent = silent;
  });

  beforeEach(() => {
    jest.spyOn(process.stdout, 'write');
    logger.winstonLogger.transports[0].silent = false;
  });

  describe('redactor', () => {
    it('should redact client_secret', () => {
      // eslint-disable-next-line @typescript-eslint/camelcase
      logger.info('Testing redaction', { obj: { client_secret: 'hello' } });
      expect(process.stdout.write).toHaveBeenCalledWith(expect.stringContaining('[REDACTED]'));
    });

    it('should be able to redact deeply nested keys', () => {
      // eslint-disable-next-line @typescript-eslint/camelcase
      logger.info('Testing redaction', { obj: { this: { is: { deep: { client_secret: 'hello' } } } } });
      expect(process.stdout.write).toHaveBeenCalledWith(expect.stringContaining('[REDACTED]'));
    });

    it('should not redact fields that have not been blacklisted', () => {
      logger.info('Testing redaction', { obj: { hi: 'hello' } });
      expect(process.stdout.write).toHaveBeenCalledWith(expect.stringContaining('hello'));
    });
  });

  describe('alert', () => {
    it('should append ALERT: to log messages', () => {
      logger.alert('Testing alert', { obj: { hi: 'hello' } });
      expect(process.stdout.write).toHaveBeenCalledWith(expect.stringContaining('ALERT: Testing alert'));
    });
  });
});
