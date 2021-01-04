/* eslint-disable @typescript-eslint/no-explicit-any */
import { transports, format, createLogger, Logger as WinstonLogger } from 'winston';
import config from 'config-dug';

const { combine, prettyPrint, timestamp, json } = format;

const devFormat = combine(json(), prettyPrint());

const prodFormat = combine(timestamp(), json());

class Logger {
  private logger: WinstonLogger;

  constructor() {
    this.logger = createLogger({
      format: process.env.NODE_ENV === 'development' ? devFormat : prodFormat,
      level: config.LOGGING_LEVEL ? (config.LOGGING_LEVEL as string) : 'info',
      transports: [new transports.Console()]
    });

    if (process.env.NODE_ENV === 'unittest') {
      this.logger.transports[0].silent = false;
    }
  }

  public debug(message: string, ...meta: any[]): void {
    this.logger.debug(message, meta);
  }

  public info(message: string, ...meta: any[]): void {
    this.logger.info(message, meta);
  }

  public error(message: string, ...meta: any[]): void {
    this.logger.error(message, meta);
  }

  public alert(message: string, ...meta: any[]): void {
    this.logger.error(`ALERT: ${message}`, meta); // triggers Datadog alert
  }
}

export default Logger;
