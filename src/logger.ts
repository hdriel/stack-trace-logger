import winston from 'winston';
import winstonDailyRotateFile from 'winston-daily-rotate-file';
import { SeqTransport } from '@datalust/winston-seq';
import CloudWatchTransport from 'winston-cloudwatch';
import {
    LOGGING_LINE_TRACE,
    LOGGING_MODE,
    NODE_ENV,
    SEQ_OPTIONS,
    CLOUDWATCH_OPTIONS,
    SERVICE_NAME,
    IS_RUNNING_ON_SERVERLESS,
} from './environment-variables';

import { LOG_DIR_PATH } from './paths';
import { REQUEST_ID } from './consts';
const colorizer = winston.format.colorize();

export type LOGGER_LEVEL = 'error' | 'warn' | 'info' | 'debug' | 'verbose' | 'useraction' | 'silly';

const enum LEVELS {
    error = 'error',
    warn = 'warn',
    info = 'info',
    debug = 'debug',
    verbose = 'verbose',
    useraction = 'useraction',
    silly = 'silly',
}

interface PRINTF {
    request_id: string;
    timestamp: string;
    message: string;
    level: LEVELS;
    [key: string]: any;
}

const LOGGING_MODE_LEVEL = LOGGING_MODE ?? LEVELS.warn;

function stringifyMetaData(metadata: string | object = '') {
    if (!metadata || typeof metadata === 'string') return metadata;

    return Object.keys(metadata).length
        ? `\n\t${Object.keys(metadata)
            .map((key) => {
                const value = (<any>metadata)[key];

                let valueStr;
                if (NODE_ENV === 'production') {
                    valueStr = value && typeof value === 'object' ? JSON.stringify(value) : value;
                } else {
                    valueStr = value && typeof value === 'object' ? JSON.stringify(value, null, 4) : value;
                }

                return `${key}: ${valueStr}`;
            })
            .filter((v) => v)
            .join(',\n\t')}`
        : '';
}

// @ts-ignore
const localMessageFormatter = ({
                                   timestamp,
                                   level,
                                   request_id,
                                   message,
                                   ...metadata
                               }: winston.Logform.TransformableInfo | PRINTF): string => {
    return IS_RUNNING_ON_SERVERLESS
        ? // https://www.brcline.com/blog/aws-lambda-logging-best-practices
        `[${level}] [reqId: ${request_id}] ${message} | ${stringifyMetaData(metadata)}`
        : colorizer.colorize(
            level,
            `${timestamp} [${level}] [${request_id}] ${message} ${stringifyMetaData(metadata)}\n`
        );
};

const cloudWatchMessageFormatter = ({
                                        timestamp,
                                        level,
                                        request_id,
                                        message,
                                        ...metadata
                                    }: winston.LogEntry | PRINTF): string => {
    return `[${level}] [reqId: ${request_id}] ${message} | ${stringifyMetaData(metadata)}`;
};

export class Logger {
    private logger;

    constructor(private readonly serviceName: string = SERVICE_NAME || 'UNDEFINED') {
        this.logger = winston.createLogger({
            transports: [
                new winston.transports.Console({
                    consoleWarnLevels: ([] as string[]).concat(LOGGING_MODE_LEVEL as string),
                    // format: winston.format.combine(
                    //     winston.format.splat(),
                    //     winston.format.timestamp(),
                    //     winston.format.printf(localMessageFormatter)
                    // ),
                }),
            ],
        });

        if (NODE_ENV === 'local') {
            const transportDailyRotateFile = new winstonDailyRotateFile({
                dirname: LOG_DIR_PATH,
                extension: '.log',
                filename: 'jlt-%DATE%' as any,
                datePattern: 'YYYY-MM-DD-HH',
                zippedArchive: true,
                maxSize: '20m',
                maxFiles: '14d',
            });

            // transportDailyRotateFile.on(
            //     'rotate',
            //     function (oldFilename, newFilename) {}
            // );

            this.logger.add(transportDailyRotateFile);
        }

        if (SEQ_OPTIONS) {
            console.log('Add SEQ winston logger extension');
            this.logger.add(new SeqTransport({ ...SEQ_OPTIONS, onError: console.error }));
        }

        if (CLOUDWATCH_OPTIONS) {
            // https://copyprogramming.com/howto/winston-cloudwatch-transport-not-creating-logs-when-running-on-lambda
            console.log('Add CLOUD WATCH winston logger extension');
            this.logger.add(
                new CloudWatchTransport({
                    ...CLOUDWATCH_OPTIONS,
                    name: `${this.serviceName}-LOGS`,
                    messageFormatter: cloudWatchMessageFormatter,
                    logStreamName: function () {
                        const date = new Date().toISOString().split('T')[0];
                        return CLOUDWATCH_OPTIONS?.logStreamName.replace('DATE', date) as string;
                    },
                })
            );
        }

        this.logger.on('error', (error: any) => {
            console.error('Logger Error Caught: ', error);
        });
    }

    private static getLineTrace(error: Error) {
        const lineTraces = error?.stack?.split('\n').filter((line) => !/\\logger\.[jt]s:\d+:\d+\),?$/.test(line)) || [];

        let lineTrace = lineTraces[1];
        for (const line of lineTraces.slice(1)) {
            const isLoggerFile = /[lL]ogger\.[tj]s:\d+:\d+\)$/.test(line.trim());
            if (!isLoggerFile) {
                lineTrace = line;
                break;
            }
        }

        return lineTrace.trimStart();
    }

    writeLog(level: LEVELS, request_id: string, message: string, options: any = {}) {
        options = JSON.parse(JSON.stringify(options));

        if (options?.hasOwnProperty('message')) {
            options.$message = options.message;
            delete options.message;
        }

        let lineTrace;
        if (LOGGING_LINE_TRACE.includes(level) || level === LEVELS.error) {
            const error = new Error(message);
            lineTrace = Logger.getLineTrace(error);
        }

        if (lineTrace) {
            options.lineTrace = lineTrace;
        }

        options.service_name = this.serviceName;

        if (IS_RUNNING_ON_SERVERLESS) {
            // @ts-ignore
            (console[level] ?? console.log)(level, message, { request_id, ...options });
        } else {
            this.logger.log(level, message, { request_id, ...options });
        }
    }

    error(request_id: string | null, message: any, metadata: any = {}) {
        this.writeLog(LEVELS.error, request_id || REQUEST_ID, message, metadata);
    }

    warn(request_id: string | null, message: any, metadata = {}) {
        this.writeLog(LEVELS.warn, request_id || REQUEST_ID, message, metadata);
    }

    info(request_id: string | null, message: any, metadata = {}) {
        this.writeLog(LEVELS.info, request_id || REQUEST_ID, message, metadata);
    }

    debug(request_id: string | null, message: any, metadata = {}) {
        this.writeLog(LEVELS.debug, request_id || REQUEST_ID, message, metadata);
    }

    verbose(request_id: string | null, message: any, metadata = {}) {
        this.writeLog(LEVELS.verbose, request_id || REQUEST_ID, message, metadata);
    }

    userAction(request_id: string | null, message: any, metadata = {}) {
        this.writeLog(LEVELS.useraction, request_id || REQUEST_ID, message, metadata);
    }

    silly(request_id: string | null, message: any, metadata = {}) {
        this.writeLog(LEVELS.silly, request_id || REQUEST_ID, message, metadata);
    }
}

const logger = new Logger();
export default logger;

// Print the first log, with the current logging mode
(<any>logger)[LOGGING_MODE_LEVEL]?.('LOGGER', 'logger instance created', { LOGGING_MODE });
