import Logger from './logger';

// These interfaces are a partial definition of express. This is to avoid a dependency on express.
export interface Request {
  method: string;
  body: unknown;
  headers: unknown;
  originalUrl?: string;
  get: (key: string) => string | undefined;
  socket: {
    remoteAddress?: string;
  };
}

export interface Response {
  locals: Record<string, unknown>;
}

type NextFunction = (err?: unknown) => void;

const getIpAddress = (req: Request): string | undefined => {
  const ipAddress = req.get('x-forwarded-for') || req.socket.remoteAddress;

  return ipAddress?.replace('::ffff:', '');
};

const redact = (redactFields: string[], input?: unknown): unknown | undefined => {
  if (!input) {
    return input;
  }

  const upperRedactFields = redactFields.map(field => field.toUpperCase());

  // deep clone object
  const object = JSON.parse(JSON.stringify(input));

  Object.keys(object).forEach(key => {
    if (upperRedactFields.includes(key.toUpperCase())) {
      object[key] = '[REDACTED]';
    } else if (typeof key === 'object') {
      redact(object.key);
    }
  });

  return object;
};

export const requestLogger = <Req extends Request, Res extends Response>(config: {
  logger: Logger;
  contextExtractor: (req: Req, res: Res) => Record<string, unknown>;
  redactFields: string[];
  logHTTPMethods: string[];
  loggingExemptRoutePatterns: string[];
}): ((req: Req, res: Res, next: NextFunction) => void) => {
  const { logger, redactFields, logHTTPMethods, loggingExemptRoutePatterns, contextExtractor } = config;

  return (req: Req, res: Res, next: NextFunction): void => {
    try {
      if (
        logHTTPMethods.includes(req.method) &&
        !loggingExemptRoutePatterns.find(pattern => req.originalUrl?.includes(pattern))
      ) {
        const context = contextExtractor(req, res);

        logger.info(`request-logger - ${req.method} ${req.originalUrl}`, {
          body: redact(redactFields, req.body),
          headers: redact(redactFields, req.headers),
          caller: {
            ipAddress: getIpAddress(req),
            ...context
          }
        });
      }
    } catch (error) {
      logger.error('request-logger - Error logging request', { error });
    }

    next();
  };
};
