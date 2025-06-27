import { createLogger, format, transports, Logger as LoggerType } from 'winston';
import Transport from 'winston-transport';
import CloudWatchTransport, { CloudwatchTransportOptions } from 'winston-cloudwatch';
import DailyRotateFile, { DailyRotateFileTransportOptions } from 'winston-daily-rotate-file';

// NOTICE: Using version 2.x.x cause to:
// seq-logging@3.0.1 THROW ERROR: Top-level await is currently not supported with the "cjs" output format
import { SeqTransport } from '@datalust/winston-seq';

import {
    LOGGING_MODE,
    NODE_ENV,
    SEQ_OPTIONS,
    CLOUDWATCH_OPTIONS,
    SERVICE_NAME,
    IS_RUNNING_ON_SERVERLESS,
    RUN_LOCALLY,
    LOGGING_LINE_TRACE,
    LOCAL_LOGS_DIR_PATH,
} from './environment-variables';
import { LOGGER_LEVEL, LoggerLevelType, REQUEST_ID } from './consts';
import { cloudWatchMessageFormatter, localMessageFormatter, getLineTrace } from './helpers';
import path from 'path';

export class Logger {
    private readonly logger;

    constructor(
        private readonly serviceName: string = SERVICE_NAME || 'UNDEFINED',
        private _loggingModeLevel: LoggerLevelType = (LOGGING_MODE as LoggerLevelType) ?? LOGGER_LEVEL.WARN,
        private readonly lineTraceLevels: LoggerLevelType[] = LOGGING_LINE_TRACE
    ) {
        this.logger = createLogger({
            level: this.loggingModeLevel,
            format: format.combine(
                format.timestamp(),
                format.errors({ stack: true }),
                format.json(),
                format.printf(localMessageFormatter)
            ),
        });
        this.logger.clear().add(new transports.Console());

        if ((RUN_LOCALLY || NODE_ENV !== 'production') && LOCAL_LOGS_DIR_PATH) {
            const fileOptions: DailyRotateFileTransportOptions = {
                dirname: path.resolve(LOCAL_LOGS_DIR_PATH),
                filename: `${this.serviceName}-%DATE%.log`,
                datePattern: 'YYYY-MM-DD-HH',
                zippedArchive: true,
                maxSize: '20m',
                maxFiles: '14d',
            };

            // @ts-ignore
            this.logger.add(new DailyRotateFile(fileOptions));
            console.log('DailyRotateFile winston logger extension Added', fileOptions);

            const fileErrorOptions: DailyRotateFileTransportOptions = {
                level: LOGGER_LEVEL.ERROR,
                dirname: path.resolve(LOCAL_LOGS_DIR_PATH),
                filename: `${this.serviceName}-%DATE%.log`,
                datePattern: 'YYYY-MM-DD-HH',
                zippedArchive: true,
                maxSize: '10m',
                maxFiles: '7d',
            };

            // @ts-ignore
            this.logger.add(new DailyRotateFile(fileErrorOptions));
        }

        if (SEQ_OPTIONS) {
            const seqOptions = {
                serverUrl: SEQ_OPTIONS?.serverUrl,
                apiKey: SEQ_OPTIONS?.apiKey,
                onError: console.error,
                handleExceptions: true,
                handleRejections: true,
            };

            this.logger.add(new SeqTransport(seqOptions));
            console.log('SEQ winston logger extension Added');
        }

        if (CLOUDWATCH_OPTIONS) {
            // https://copyprogramming.com/howto/winston-cloudwatch-transport-not-creating-logs-when-running-on-lambda
            const cwOptions: CloudwatchTransportOptions = {
                ...CLOUDWATCH_OPTIONS,
                name: `${this.serviceName}-LOGS`,
                messageFormatter: cloudWatchMessageFormatter,
                logStreamName: function () {
                    const date = new Date().toISOString().split('T')[0];
                    return CLOUDWATCH_OPTIONS?.logStreamName.replace('DATE', date) as string;
                },
            };
            this.logger.add(new CloudWatchTransport(cwOptions));
            console.log('CloudWatch winston logger extension Added');
        }

        this.logger.on('error', (error: any) => {
            // error fallback message to console
            console.error('Logger Error Caught: ', error);
        });

        this.logger[this.loggingModeLevel]?.('LOGGER', 'logger instance created', { lineTrace: true });
    }

    addTransport(transport: Transport) {
        this.logger.add(transport);
    }

    get loggingModeLevel() {
        return this._loggingModeLevel;
    }

    writeLog(level: LoggerLevelType, request_id: string, message: string, options: any = {}) {
        options = JSON.parse(JSON.stringify(options));
        options.service_name = this.serviceName;

        if (options?.hasOwnProperty('message')) {
            // I dont remember why i force to put $message instead of message
            options.$message = options.message;
            delete options.message;
        }

        let lineTrace;
        if (this.lineTraceLevels.includes(level) || level === LOGGER_LEVEL.ERROR) {
            const error = new Error(message); // must make Error right here
            lineTrace = getLineTrace(error);
        }
        if (lineTrace) options.line_trace = lineTrace;

        // serverless logs got correctly from console
        if (IS_RUNNING_ON_SERVERLESS) {
            // @ts-ignore
            (console[level] ?? console.log)(level, message, { request_id, ...options });
            return;
        }

        this.logger.log(level, message, { request_id, ...options });
    }

    error(request_id: string | null, message: any, metadata: any = {}) {
        this.writeLog(LOGGER_LEVEL.ERROR, request_id || REQUEST_ID, message, metadata);
    }

    warn(request_id: string | null, message: any, metadata = {}) {
        this.writeLog(LOGGER_LEVEL.WARN, request_id || REQUEST_ID, message, metadata);
    }

    info(request_id: string | null, message: any, metadata = {}) {
        this.writeLog(LOGGER_LEVEL.INFO, request_id || REQUEST_ID, message, metadata);
    }

    debug(request_id: string | null, message: any, metadata = {}) {
        this.writeLog(LOGGER_LEVEL.DEBUG, request_id || REQUEST_ID, message, metadata);
    }

    verbose(request_id: string | null, message: any, metadata = {}) {
        this.writeLog(LOGGER_LEVEL.VERBOSE, request_id || REQUEST_ID, message, metadata);
    }

    http(request_id: string | null, message: any, metadata = {}) {
        this.writeLog(LOGGER_LEVEL.HTTP, request_id || REQUEST_ID, message, metadata);
    }

    silly(request_id: string | null, message: any, metadata = {}) {
        this.writeLog(LOGGER_LEVEL.SILLY, request_id || REQUEST_ID, message, metadata);
    }

    child(options: Record<string, any>): LoggerType {
        return this.logger.child(options);
    }
}
