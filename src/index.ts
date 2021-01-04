import { transports, format, createLogger } from 'winston';
import config from 'config-dug';

const { combine, prettyPrint, timestamp, json } = format;

const devFormat = combine(json(), prettyPrint());

const prodFormat = combine(timestamp(), json());

const logger = createLogger({
  format: process.env.NODE_ENV === 'development' ? devFormat : prodFormat,
  level: config.LOGGING_LEVEL ? (config.LOGGING_LEVEL as string) : 'info',
  transports: [new transports.Console()]
});

if (process.env.NODE_ENV === 'unittest') {
  logger.transports[0].silent = false;
}

export default logger;
export { logger };
