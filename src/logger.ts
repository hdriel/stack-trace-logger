import { createLogger, format, transports, Logger as LoggerType } from 'winston';
import Transport from 'winston-transport';
// NOTICE: Using version 2.x.x cause to:
// seq-logging@3.0.1 THROW ERROR: Top-level await is currently not supported with the "cjs" output format
import { SeqTransport } from '@datalust/winston-seq';
import CloudWatchTransport, { CloudwatchTransportOptions } from 'winston-cloudwatch';
import {
    LOGGING_MODE,
    NODE_ENV,
    SEQ_OPTIONS,
    CLOUDWATCH_OPTIONS,
    SERVICE_NAME,
    IS_RUNNING_ON_SERVERLESS,
    RUN_LOCALLY,
    LOGGING_LINE_TRACE,
} from './environment-variables';
import { LOG_DIR_PATH } from './paths';
import { LOGGER_LEVEL, REQUEST_ID } from './consts';
import { cloudWatchMessageFormatter, localMessageFormatter, getLineTrace } from './helpers';

export class Logger {
    private readonly logger;

    constructor(
        private readonly serviceName: string = SERVICE_NAME || 'UNDEFINED',
        private _loggingModeLevel: LOGGER_LEVEL = (LOGGING_MODE as LOGGER_LEVEL) ?? LOGGER_LEVEL.warn,
        private readonly lineTraceLevels: LOGGER_LEVEL[] = LOGGING_LINE_TRACE
    ) {
        this.logger = createLogger({
            level: this.loggingModeLevel,
            transports: [new transports.Console()],
            format: format.combine(
                format.timestamp(),
                format.errors({ stack: true }),
                format.json(),
                format.printf(localMessageFormatter)
            ),
        });

        if ((RUN_LOCALLY || NODE_ENV !== 'production') && LOG_DIR_PATH) {
            this.logger.add(
                new transports.File({
                    dirname: LOG_DIR_PATH,
                    filename: `${this.serviceName}-${new Date().toLocaleString()}.log` as any,
                    // zippedArchive: true,
                    maxsize: 20,
                    maxFiles: 14,
                })
            );
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
            console.log('CLOUD WATCH winston logger extension Added');
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

    writeLog(level: LOGGER_LEVEL, request_id: string, message: string, options: any = {}) {
        options = JSON.parse(JSON.stringify(options));
        options.service_name = this.serviceName;

        if (options?.hasOwnProperty('message')) {
            // I dont remember why i force to put $message instead of message
            options.$message = options.message;
            delete options.message;
        }

        let lineTrace;
        if (this.lineTraceLevels.includes(level) || level === LOGGER_LEVEL.error) {
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
        this.writeLog(LOGGER_LEVEL.error, request_id || REQUEST_ID, message, metadata);
    }

    warn(request_id: string | null, message: any, metadata = {}) {
        this.writeLog(LOGGER_LEVEL.warn, request_id || REQUEST_ID, message, metadata);
    }

    info(request_id: string | null, message: any, metadata = {}) {
        this.writeLog(LOGGER_LEVEL.info, request_id || REQUEST_ID, message, metadata);
    }

    debug(request_id: string | null, message: any, metadata = {}) {
        this.writeLog(LOGGER_LEVEL.debug, request_id || REQUEST_ID, message, metadata);
    }

    verbose(request_id: string | null, message: any, metadata = {}) {
        this.writeLog(LOGGER_LEVEL.verbose, request_id || REQUEST_ID, message, metadata);
    }

    http(request_id: string | null, message: any, metadata = {}) {
        this.writeLog(LOGGER_LEVEL.http, request_id || REQUEST_ID, message, metadata);
    }

    silly(request_id: string | null, message: any, metadata = {}) {
        this.writeLog(LOGGER_LEVEL.silly, request_id || REQUEST_ID, message, metadata);
    }

    child(options: Record<string, any>): LoggerType {
        return this.logger.child(options);
    }
}
