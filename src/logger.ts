/* eslint-disable @typescript-eslint/no-explicit-any */
import { transports, format, createLogger, Logger as WinstonLogger } from 'winston';
import config from 'config-dug';

import redactor from './redactor';

const { combine, prettyPrint, timestamp, json } = format;

const devFormat = combine(redactor(), json(), prettyPrint());

const prodFormat = combine(redactor(), timestamp(), json());

class Logger {
  public winstonLogger: WinstonLogger;

  constructor() {
    this.winstonLogger = createLogger({
      format: process.env.NODE_ENV === 'development' ? devFormat : prodFormat,
      level: config.LOGGING_LEVEL ? (config.LOGGING_LEVEL as string) : 'info',
      transports: [new transports.Console()]
    });

    if (process.env.NODE_ENV === 'unittest') {
      this.winstonLogger.transports[0].silent = true;
    }
  }

  public debug(message: string, ...meta: any[]): void {
    this.winstonLogger.debug(message, meta);
  }

  public warn(message: string, ...meta: any[]): void {
    this.winstonLogger.warn(message, meta);
  }

  public info(message: string, ...meta: any[]): void {
    this.winstonLogger.info(message, meta);
  }

  public error(message: string, ...meta: any[]): void {
    this.winstonLogger.error(message, meta);
  }

  public alert(message: string, ...meta: any[]): void {
    this.winstonLogger.error(`ALERT: ${message}`, meta); // triggers Datadog alert
  }
}

export default Logger;
