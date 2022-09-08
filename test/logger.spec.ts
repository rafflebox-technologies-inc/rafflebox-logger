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

    it('should redact Authorization', () => {
      logger.info('Testing redaction', {
        obj: {
          Authorization: 'Authorization Data'
        }
      });
      expect(process.stdout.write).not.toHaveBeenCalledWith(expect.stringContaining('Authorization Data'));
      expect(process.stdout.write).toHaveBeenCalledWith(expect.stringContaining('[REDACTED]'));
    });

    it('should be able to redact regardless of case sensitivity', () => {
      logger.info('Testing redaction', {
        obj: {
          aUtHoRiZaTiOn: 'Authorization Data'
        }
      });
      expect(process.stdout.write).not.toHaveBeenCalledWith(expect.stringContaining('Authorization Data'));
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
    describe('captureKeys', () => {
      it('postal', () => {
        const data = {
          postal: 'B0J1V7'
        };

        logger.info('hello world', data);

        expect(process.stdout.write).toHaveBeenCalledWith(expect.stringContaining('"postal":"B0J1V7"'));
      });
      it('email', () => {
        const data = {
          email: 'jamie3@gmail.com'
        };

        logger.info('hello world', data);

        expect(process.stdout.write).toHaveBeenCalledWith(expect.stringContaining('"email":"jamie3@gmail.com"'));
      });

      it('province', () => {
        const data = {
          province: 'AB'
        };

        logger.info('hello world', data);

        expect(process.stdout.write).toHaveBeenCalledWith(expect.stringContaining('"province":"AB"'));
      });

      it('phone', () => {
        const data = {
          phone: '9025551234'
        };

        logger.info('hello world', data);

        expect(process.stdout.write).toHaveBeenCalledWith(expect.stringContaining('"phone":"9025551234"'));
      });

      it('locale', () => {
        const data = {
          locale: 'en'
        };

        logger.info('hello world', data);

        expect(process.stdout.write).toHaveBeenCalledWith(expect.stringContaining('"locale":"en"'));
      });
    });
    describe('organization', () => {
      it('id -> organizationNumber', () => {
        const data = {
          organization: {
            id: 1
          }
        };

        logger.info('hello world', data);

        expect(process.stdout.write).toHaveBeenCalledWith(expect.stringContaining('"organizationNumber":1'));
      });

      it('id -> organizationId', () => {
        const data = {
          organization: {
            id: 'ee45e605-fa42-4a64-9b51-91fed9f8caae'
          }
        };

        logger.info('hello world', data);

        expect(process.stdout.write).toHaveBeenCalledWith(
          expect.stringContaining('"organizationId":"ee45e605-fa42-4a64-9b51-91fed9f8caae"')
        );
      });

      it('uuid -> organizationId', () => {
        const data = {
          organization: {
            uuid: 'ee45e605-fa42-4a64-9b51-91fed9f8caae'
          }
        };

        logger.info('hello world', data);

        expect(process.stdout.write).toHaveBeenCalledWith(
          expect.stringContaining('"organizationId":"ee45e605-fa42-4a64-9b51-91fed9f8caae"')
        );
      });
    });

    describe('order', () => {
      it('id -> orderNumber', () => {
        const data = {
          order: {
            id: 1
          }
        };

        logger.info('hello world', data);

        expect(process.stdout.write).toHaveBeenCalledWith(expect.stringContaining('"orderNumber":1'));
      });

      it('id -> orderId', () => {
        const data = {
          order: {
            id: 'ee45e605-fa42-4a64-9b51-91fed9f8caae'
          }
        };

        logger.info('hello world', data);

        expect(process.stdout.write).toHaveBeenCalledWith(
          expect.stringContaining('"orderId":"ee45e605-fa42-4a64-9b51-91fed9f8caae"')
        );
      });

      it('uuid -> orderId', () => {
        const data = {
          order: {
            uuid: 'ee45e605-fa42-4a64-9b51-91fed9f8caae'
          }
        };

        logger.info('hello world', data);

        expect(process.stdout.write).toHaveBeenCalledWith(
          expect.stringContaining('"orderId":"ee45e605-fa42-4a64-9b51-91fed9f8caae"')
        );
      });

      it('email -> email', () => {
        const data = {
          order: {
            email: 'bob@villa.com'
          }
        };

        logger.info('hello world', data);

        expect(process.stdout.write).toHaveBeenCalledWith(expect.stringContaining('"email":"bob@villa.com"'));
      });

      it('province -> province', () => {
        const data = {
          order: {
            province: 'BC'
          }
        };

        logger.info('hello world', data);

        expect(process.stdout.write).toHaveBeenCalledWith(expect.stringContaining('"province":"BC"'));
      });

      it('state -> province', () => {
        const data = {
          order: {
            state: 'AB'
          }
        };

        logger.info('hello world', data);

        expect(process.stdout.write).toHaveBeenCalledWith(expect.stringContaining('"province":"AB"'));
      });

      it('provinceState -> province', () => {
        const data = {
          order: {
            provinceState: 'NS'
          }
        };

        logger.info('hello world', data);

        expect(process.stdout.write).toHaveBeenCalledWith(expect.stringContaining('"province":"NS"'));
      });

      it('referenceId -> orderReferenceId', () => {
        const data = {
          order: {
            referenceId: 'abc'
          }
        };

        logger.info('hello world', data);

        expect(process.stdout.write).toHaveBeenCalledWith(expect.stringContaining('"orderReferenceId":"abc"'));
      });
    });

    describe('device', () => {
      it('serialNumber -> deviceSerialNumber', () => {
        const data = {
          device: {
            serialNumber: '123456789'
          }
        };

        logger.info('hello world', data);

        expect(process.stdout.write).toHaveBeenCalledWith(expect.stringContaining('"deviceSerialNumber":"123456789"'));
      });
    });

    describe('event', () => {
      it('id -> eventNumber', () => {
        const data = {
          event: {
            id: 1
          }
        };

        logger.info('hello world', data);

        expect(process.stdout.write).toHaveBeenCalledWith(expect.stringContaining('"eventNumber":1'));
      });

      it('id -> eventId', () => {
        const data = {
          event: {
            id: 'b21a61f6-6fff-4991-a03a-d12d04936ab5'
          }
        };

        logger.info('hello world', data);

        expect(process.stdout.write).toHaveBeenCalledWith(
          expect.stringContaining('"eventId":"b21a61f6-6fff-4991-a03a-d12d04936ab5"')
        );
      });

      it('uuid -> eventId', () => {
        const data = {
          event: {
            uuid: 'b21a61f6-6fff-4991-a03a-d12d04936ab5'
          }
        };

        logger.info('hello world', data);

        expect(process.stdout.write).toHaveBeenCalledWith(
          expect.stringContaining('"eventId":"b21a61f6-6fff-4991-a03a-d12d04936ab5"')
        );
      });
    });
  });
});
