import logger from '../src';

import { requestLogger, Request, Response } from '../src/request-logger';

describe('request-logger', () => {
  let req: Request;
  let res: Response;
  let next = jest.fn();

  beforeEach(() => {
    req = {
      body: {},
      get: jest.fn(),
      originalUrl: 'original-url',
      headers: {
        'rb-client': 'TEST'
      },
      method: 'POST',
      socket: {
        remoteAddress: 'remote-address'
      }
    };

    res = {
      locals: {}
    };

    next = jest.fn();

    jest.spyOn(logger, 'info').mockReturnValue();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should not log if request method is not enabled', () => {
    req.method = 'Not method';

    requestLogger({
      extractContext: () => ({}),
      logger,
      loggingExemptRoutePatterns: [],
      logHTTPMethods: ['POST'],
      redactFields: []
    })(req, res, next);

    expect(logger.info).toHaveBeenCalledTimes(0);
  });

  it('should not log if request url is exempt', () => {
    req.originalUrl = '/testing-stuff';

    requestLogger({
      extractContext: () => ({}),
      logger,
      loggingExemptRoutePatterns: ['/testing-stuff'],
      logHTTPMethods: ['POST'],
      redactFields: []
    })(req, res, next);

    expect(logger.info).toHaveBeenCalledTimes(0);
  });

  it('should redact headers and body', () => {
    req.body = {
      password: 'My Password'
    };

    req.headers = { 'rb-client': 'TEST', Authorization: 'My token' };

    requestLogger({
      extractContext: () => ({}),
      logger,
      loggingExemptRoutePatterns: [],
      logHTTPMethods: ['POST'],
      redactFields: ['password', 'authorization']
    })(req, res, next);

    expect(logger.info).toHaveBeenCalledTimes(1);
    expect(logger.info).toHaveBeenCalledWith(`request-logger - POST original-url`, {
      body: {
        password: '[REDACTED]'
      },
      headers: {
        'rb-client': 'TEST',
        Authorization: '[REDACTED]'
      },
      caller: {
        ipAddress: 'remote-address'
      }
    });
  });

  it('should include the results of the contextExtractor in the caller info', () => {
    requestLogger({
      extractContext: () => ({ testing: 'test' }),
      logger,
      loggingExemptRoutePatterns: [],
      logHTTPMethods: ['POST'],
      redactFields: []
    })(req, res, next);

    expect(logger.info).toHaveBeenCalledTimes(1);
    expect(logger.info).toHaveBeenCalledWith(
      `request-logger - POST original-url`,
      expect.objectContaining({
        caller: {
          ipAddress: 'remote-address',
          testing: 'test'
        }
      })
    );
  });
});
