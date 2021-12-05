/* eslint-disable @typescript-eslint/no-explicit-any */
import { transports, format, createLogger, Logger as WinstonLogger } from 'winston';
// eslint-disable-next-line import/no-extraneous-dependencies
import config from 'config-dug';
import chalk from 'chalk';

import redactor from './redactor';

const { combine, timestamp, json } = format;

const devFormat = combine(
  redactor(),
  format.printf(i => {
    const logMessage = `${i.message}`;

    if (i.level === 'info') {
      return chalk.cyan(logMessage);
    } else if (i.level === 'error') {
      return chalk.red(logMessage);
    } else if (i.level === 'warn') {
      return chalk.yellow(logMessage);
    } else if (i.level === 'debug') {
      return chalk.magenta(logMessage);
    } else {
      return logMessage;
    }
  })
);

const prodFormat = combine(redactor(), timestamp(), json());
const logFormat = process.env.NODE_ENV === 'development' ? devFormat : prodFormat;

class Logger {
  public winstonLogger: WinstonLogger;

  constructor() {
    this.winstonLogger = createLogger({
      format: config.LOGGING_FORMAT === 'pretty' ? devFormat : logFormat,
      level: config.LOGGING_LEVEL ? (config.LOGGING_LEVEL as string) : 'info',
      transports: [new transports.Console()]
    });

    if (config.LOGGING_SILENT) {
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
