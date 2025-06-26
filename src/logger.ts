import { createLogger, format, transports } from 'winston';
// import { SeqTransport } from '@datalust/winston-seq';
import CloudWatchTransport from 'winston-cloudwatch';
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

const { combine, timestamp, printf } = format;

export class Logger {
    private logger;

    constructor(
        private readonly serviceName: string = SERVICE_NAME || 'UNDEFINED',
        private _loggingModeLevel: LOGGER_LEVEL = (LOGGING_MODE as LOGGER_LEVEL) ?? LOGGER_LEVEL.warn,
        private readonly lineTraceLevels: LOGGER_LEVEL[] = LOGGING_LINE_TRACE
    ) {
        this.logger = createLogger({
            level: this.loggingModeLevel,
            format: combine(timestamp(), printf(localMessageFormatter)),
            transports: [new transports.Console()],
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
            console.log('Add SEQ winston logger extension');
            // this.logger.add(new SeqTransport({ ...SEQ_OPTIONS, onError: console.error }));
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
            // error fallback message to console
            console.error('Logger Error Caught: ', error);
        });

        this.logger[this.loggingModeLevel]?.('LOGGER', 'logger instance created', { lineTrace: true });
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
}
