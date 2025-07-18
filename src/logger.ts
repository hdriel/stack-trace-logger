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
    RUN_LOCALLY,
    LOGGING_LINE_TRACE,
    LOCAL_LOGS_DIR_PATH,
} from './environment-variables';
import { LOGGER_LEVEL, LoggerLevelType, REQUEST_ID, TRANSPORT, TransportType } from './consts';
import { cloudWatchMessageFormatter, localMessageFormatter, getLineTrace } from './helpers';
import path from 'path';

export class Logger {
    private readonly logger: LoggerType;
    private transportByType: Record<TransportType, Transport> = {} as Record<TransportType, Transport>;

    constructor(
        private readonly serviceName: string = SERVICE_NAME || 'UNDEFINED',
        private _loggingModeLevel: LoggerLevelType = LOGGING_MODE ?? LOGGER_LEVEL.WARN,
        private readonly lineTraceLevels: LoggerLevelType[] = LOGGING_LINE_TRACE,
        private readonly tagProps: string[] = ['reqId']
    ) {
        this.logger = createLogger({
            level: this.loggingModeLevel,
            format: format.combine(
                format.timestamp(),
                format.errors({ stack: true }),
                format.json(),
                format.printf((props) => localMessageFormatter(props, this.tagProps))
            ),
        }).clear();

        const consoleTransport = new transports.Console();
        this.logger.add(consoleTransport);
        this.transportByType[TRANSPORT.CONSOLE] = consoleTransport;

        if ((RUN_LOCALLY || NODE_ENV !== 'production') && LOCAL_LOGS_DIR_PATH) {
            {
                const fileOptions: DailyRotateFileTransportOptions = {
                    dirname: path.resolve(LOCAL_LOGS_DIR_PATH),
                    filename: `${this.serviceName}-%DATE%.log`,
                    datePattern: 'YYYY-MM-DD-HH',
                    zippedArchive: true,
                    maxSize: '20m',
                    maxFiles: '14d',
                };
                const dailyRotateFileTransport = new DailyRotateFile(fileOptions);
                this.logger.add(dailyRotateFileTransport);
                this.transportByType[TRANSPORT.FILE] = dailyRotateFileTransport;
                console.log('DailyRotateFile winston logger extension Added for all levels', fileOptions);
            }

            {
                const fileErrorOptions: DailyRotateFileTransportOptions = {
                    level: LOGGER_LEVEL.ERROR,
                    dirname: path.resolve(LOCAL_LOGS_DIR_PATH),
                    filename: `${this.serviceName}-%DATE%.log`,
                    datePattern: 'YYYY-MM-DD-HH',
                    zippedArchive: true,
                    maxSize: '10m',
                    maxFiles: '7d',
                };

                const dailyRotateFileTransport = new DailyRotateFile(fileErrorOptions);
                this.logger.add(dailyRotateFileTransport);
                this.transportByType[TRANSPORT.FILE_ERROR] = dailyRotateFileTransport;
                console.log(
                    `DailyRotateFile winston logger extension Added for '${LOGGER_LEVEL.ERROR}' levels`,
                    fileErrorOptions
                );
            }
        }

        if (SEQ_OPTIONS) {
            const seqOptions = {
                serverUrl: SEQ_OPTIONS?.serverUrl,
                apiKey: SEQ_OPTIONS?.apiKey,
                onError: console.error,
                handleExceptions: true,
                handleRejections: true,
            };

            const seqTransport = new SeqTransport(seqOptions);
            this.logger.add(seqTransport);
            this.transportByType[TRANSPORT.SEQ] = seqTransport;
            console.log('SEQ winston logger extension Added');
        }

        if (CLOUDWATCH_OPTIONS) {
            // https://copyprogramming.com/howto/winston-cloudwatch-transport-not-creating-logs-when-running-on-lambda
            const cwOptions: CloudwatchTransportOptions = {
                ...CLOUDWATCH_OPTIONS,
                name: `${this.serviceName}-LOGS`,
                messageFormatter: (props) => cloudWatchMessageFormatter(props, this.tagProps),
                logStreamName: function () {
                    const date = new Date().toISOString().split('T')[0];
                    return CLOUDWATCH_OPTIONS?.logStreamName.replace('DATE', date) as string;
                },
            };

            const cloudWatchTransport = new CloudWatchTransport(cwOptions);
            this.logger.add(cloudWatchTransport);
            this.transportByType[TRANSPORT.CLOUD_WATCH] = cloudWatchTransport;
            console.log('CloudWatch winston logger extension Added');
        }

        this.logger.on('error', (error: any) => {
            // error fallback message to console
            console.error('Logger Error Caught: ', error);
        });

        this.logger[this.loggingModeLevel]?.('LOGGER', 'logger instance created', { lineTrace: true });
    }

    clearTransports() {
        this.logger.clear();
    }

    addTransport(transport: TransportType | Transport) {
        if (transport instanceof Transport) {
            this.logger.add(transport);
            return;
        }

        const buildInTransport = this.transportByType[transport as TransportType];
        if (buildInTransport) this.logger.add(buildInTransport);
    }

    removeTransport(transport: TransportType | Transport) {
        if (transport instanceof Transport) {
            this.logger.remove(transport as Transport);
            return;
        }

        const buildInTransport = this.transportByType[transport as TransportType];
        if (buildInTransport) this.logger.remove(buildInTransport);
    }

    hasTransport(transport: TransportType) {
        const buildInTransport = this.transportByType[transport as TransportType];
        return !!buildInTransport;
    }

    get loggingModeLevel() {
        return this._loggingModeLevel;
    }

    get instance(): LoggerType {
        return this.logger;
    }

    writeLog(level: LoggerLevelType, reqId: string, message: string, options: any = {}) {
        options = JSON.parse(JSON.stringify(options));
        options.service_name = this.serviceName;

        if (options?.hasOwnProperty('message')) {
            // I don't remember why i force to put $message instead of message
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
        if (!RUN_LOCALLY) {
            const line = cloudWatchMessageFormatter({
                level,
                message,
                reqId,
                timestamp: new Date().toISOString(),
                ...options,
            });

            // @ts-ignore
            (console[level] ?? console.log)(line);
        } else {
            this.logger.log(level, message, { reqId, ...options });
        }
    }

    error(reqId: string | null, message: any, metadata: any = {}) {
        this.writeLog(LOGGER_LEVEL.ERROR, reqId || REQUEST_ID, message, metadata);
    }

    warn(reqId: string | null, message: any, metadata = {}) {
        this.writeLog(LOGGER_LEVEL.WARN, reqId || REQUEST_ID, message, metadata);
    }

    info(reqId: string | null, message: any, metadata = {}) {
        this.writeLog(LOGGER_LEVEL.INFO, reqId || REQUEST_ID, message, metadata);
    }

    debug(reqId: string | null, message: any, metadata = {}) {
        this.writeLog(LOGGER_LEVEL.DEBUG, reqId || REQUEST_ID, message, metadata);
    }

    verbose(reqId: string | null, message: any, metadata = {}) {
        this.writeLog(LOGGER_LEVEL.VERBOSE, reqId || REQUEST_ID, message, metadata);
    }

    http(reqId: string | null, message: any, metadata = {}) {
        this.writeLog(LOGGER_LEVEL.HTTP, reqId || REQUEST_ID, message, metadata);
    }

    silly(reqId: string | null, message: any, metadata = {}) {
        this.writeLog(LOGGER_LEVEL.SILLY, reqId || REQUEST_ID, message, metadata);
    }

    child(options: Record<string, any>): LoggerType {
        return this.logger.child(options);
    }
}
