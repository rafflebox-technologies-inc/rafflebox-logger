import Logger from '../src/logger';

const logger = new Logger();

const silent = logger.winstonLogger.transports[0].silent;

describe('logger', () => {
  beforeEach(() => {
    jest.spyOn(process.stdout, 'write');

    logger.winstonLogger.transports[0].silent = false;
  });

  afterEach(() => {
    jest.restoreAllMocks();
    logger.winstonLogger.transports[0].silent = silent;
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

  describe('extractData', () => {
    const data = {
      order: {
        id: 1,
        uuid: 'ee45e605-fa42-4a64-9b51-91fed9f8caae',
        email: 'bob@villa.com',
        province: 'BC',
        state: 'AB'
      },
      device: {
        serialNumber: '123456789'
      },
      event: {
        id: 1,
        uuid: 'b21a61f6-6fff-4991-a03a-d12d04936ab5'
      },
      info: {
        referenceId: 'pi_3K9YkpB7JcYxrNaO0soQ3vpl'
      }
    };

    it('should log with extracted data', () => {
      logger.info('hello world', data);

      expect(process.stdout.write).toHaveBeenCalledWith(expect.stringContaining('"deviceSerialNumber":"123456789"'));
      expect(process.stdout.write).toHaveBeenCalledWith(expect.stringContaining('"email":"bob@villa.com"'));
      expect(process.stdout.write).toHaveBeenCalledWith(
        expect.stringContaining('"eventId":"b21a61f6-6fff-4991-a03a-d12d04936ab5"')
      );
      expect(process.stdout.write).toHaveBeenCalledWith(expect.stringContaining('"province":"BC"'));
      expect(process.stdout.write).toHaveBeenCalledWith(expect.stringContaining('"province":"AB"'));
      expect(process.stdout.write).toHaveBeenCalledWith(
        expect.stringContaining('"referenceId":"pi_3K9YkpB7JcYxrNaO0soQ3vpl"')
      );
    });
  });
});
