import winston, { Logger as LoggerType } from 'winston';
import Transport from 'winston-transport';
import CloudWatchTransport, { type CloudwatchTransportOptions } from 'winston-cloudwatch';
import DailyRotateFile, { type DailyRotateFileTransportOptions } from 'winston-daily-rotate-file';
// NOTICE: Using version 2.x.x cause to:
// seq-logging@3.0.1 THROW ERROR: Top-level await is currently not supported with the "cjs" output format
import { SeqTransport } from '@datalust/winston-seq';
import { LOGGER_LEVEL, type LoggerLevelType, NODE_ENV, REQUEST_ID, TRANSPORT } from './consts';
import { cloudWatchMessageFormatter, localMessageFormatter, getLineTrace } from './helpers';
import path from 'pathe';

type MetaDataOptionsType = { stackTraceLines?: number; [key: string]: any };

export class Logger {
    private readonly logger: LoggerType;
    private readonly serviceName: string;
    private readonly _loggingModeLevel: LoggerLevelType;
    private readonly lineTraceLevels: LoggerLevelType[];
    private readonly runLocally: boolean;
    private readonly stackTraceLines: number | Partial<Record<LoggerLevelType, number>>;
    private readonly tags: string[];
    private transportByType: Record<TRANSPORT, Transport> = {} as Record<TRANSPORT, Transport>;

    constructor({
        serviceName = 'LOGGER',
        loggingModeLevel = LOGGER_LEVEL.WARN,
        lineTraceLevels = [LOGGER_LEVEL.ERROR],
        tags = ['reqId'],
        transportSeqOptions,
        transportCloudWatchOptions,
        transportDailyRotateFileOptions,
        transportDailyErrorRotateFileOptions,
        transportConsole = true,
        defaultMetaData,
        stackTraceLines = 1,
        runLocally = !['production', 'prod', 'dev'].includes(NODE_ENV),
    }: {
        serviceName?: string;
        loggingModeLevel?: LoggerLevelType;
        lineTraceLevels?: LoggerLevelType[];
        tags?: string[];
        transportSeqOptions?: { serverUrl: string; apiKey: string };
        transportDailyRotateFileOptions?: Partial<DailyRotateFileTransportOptions>;
        transportDailyErrorRotateFileOptions?: Partial<DailyRotateFileTransportOptions>;
        runLocally?: boolean;
        transportConsole?: boolean;
        stackTraceLines?: number | Partial<Record<LoggerLevelType, number>>;
        defaultMetaData?: Record<string, any>;
        transportCloudWatchOptions?: {
            logGroupName: string;
            logStreamName: string;
            awsAccessKeyId: string;
            awsSecretKey: string;
            awsRegion: string;
            retentionInDays: number;
        };
    }) {
        this.serviceName = serviceName;
        this._loggingModeLevel = loggingModeLevel;
        this.lineTraceLevels = lineTraceLevels;
        this.runLocally = runLocally;
        this.tags = tags;
        this.stackTraceLines = stackTraceLines;

        this.logger = winston
            .createLogger({
                level: this.loggingModeLevel,
                levels: winston.config.npm.levels,
                defaultMeta: { ...defaultMetaData },
            })
            .clear();

        if (transportConsole) {
            const consoleTransport = new winston.transports.Console({
                format: winston.format.combine(
                    winston.format.timestamp(),
                    winston.format.errors({ stack: true }),
                    winston.format.json(),
                    winston.format.printf((props) => localMessageFormatter({ ...props, colorize: true }, this.tags))
                ),
            });
            this.logger.add(consoleTransport);
            this.transportByType[TRANSPORT.CONSOLE] = consoleTransport;
        }

        if (transportDailyRotateFileOptions?.dirname) {
            const fileOptions: DailyRotateFileTransportOptions = {
                ...transportDailyRotateFileOptions,
                dirname: path.resolve(transportDailyRotateFileOptions.dirname),
                filename: transportDailyRotateFileOptions.filename || `${this.serviceName}-%DATE%.log`,
                datePattern: transportDailyRotateFileOptions.datePattern || 'YYYY-MM-DD-HH',
                zippedArchive: transportDailyRotateFileOptions.zippedArchive ?? true,
                maxSize: transportDailyRotateFileOptions.maxSize || '20m',
                maxFiles: transportDailyRotateFileOptions.maxFiles || '14d',
            } as DailyRotateFileTransportOptions;

            const dailyRotateFileTransport = new DailyRotateFile(fileOptions);
            this.logger.add(dailyRotateFileTransport);
            this.transportByType[TRANSPORT.FILE] = dailyRotateFileTransport;
            console.log('DailyRotateFile winston logger extension Added for all levels', fileOptions);
        }

        if (transportDailyErrorRotateFileOptions?.dirname) {
            {
                const fileErrorOptions: DailyRotateFileTransportOptions = {
                    ...transportDailyErrorRotateFileOptions,
                    level: LOGGER_LEVEL.ERROR,
                    dirname: path.resolve(transportDailyErrorRotateFileOptions.dirname),
                    filename:
                        transportDailyErrorRotateFileOptions.dirname ?? `${this.serviceName}-error-level-%DATE%.log`,
                    datePattern: transportDailyErrorRotateFileOptions.datePattern ?? 'YYYY-MM-DD-HH',
                    zippedArchive: transportDailyErrorRotateFileOptions.zippedArchive ?? true,
                    maxSize: transportDailyErrorRotateFileOptions.maxSize ?? '10m',
                    maxFiles: transportDailyErrorRotateFileOptions.maxFiles ?? '7d',
                } as DailyRotateFileTransportOptions;

                const dailyRotateFileTransport = new DailyRotateFile(fileErrorOptions);
                this.logger.add(dailyRotateFileTransport);
                this.transportByType[TRANSPORT.FILE_ERROR] = dailyRotateFileTransport;
                console.log(
                    `DailyRotateFile winston logger extension Added for '${LOGGER_LEVEL.ERROR}' levels`,
                    fileErrorOptions
                );
            }
        }

        if (transportSeqOptions?.apiKey) {
            const seqOptionsConfig = {
                ...transportSeqOptions,
                serverUrl: transportSeqOptions?.serverUrl,
                apiKey: transportSeqOptions?.apiKey,
                onError: console.error,
                handleExceptions: true,
                handleRejections: true,
            };

            const seqTransport = new SeqTransport(seqOptionsConfig);
            this.logger.add(seqTransport);
            this.transportByType[TRANSPORT.SEQ] = seqTransport;
            console.log('SEQ winston logger extension Added');
        }

        if (transportCloudWatchOptions) {
            // https://copyprogramming.com/howto/winston-cloudwatch-transport-not-creating-logs-when-running-on-lambda
            const cwOptions: CloudwatchTransportOptions = {
                ...transportCloudWatchOptions,
                name: `${this.serviceName}-LOGS`,
                messageFormatter: (props) => cloudWatchMessageFormatter(props, this.tags),
                logStreamName: function () {
                    const date = new Date().toISOString().split('T')[0];
                    return transportCloudWatchOptions?.logStreamName.replace('DATE', date) as string;
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

    addTransport(transport: TRANSPORT | Transport) {
        if (transport instanceof Transport) {
            this.logger.add(transport);
            return;
        }

        const buildInTransport = this.transportByType[transport];
        if (buildInTransport) this.logger.add(buildInTransport);
    }

    removeTransport(transport: TRANSPORT | Transport) {
        if (transport instanceof Transport) {
            this.logger.remove(transport as Transport);
            return;
        }

        const buildInTransport = this.transportByType[transport];
        if (buildInTransport) this.logger.remove(buildInTransport);
    }

    hasTransport(transport: TRANSPORT) {
        const buildInTransport = this.transportByType[transport];
        return !!buildInTransport;
    }

    get loggingModeLevel() {
        return this._loggingModeLevel;
    }

    get instance(): LoggerType {
        return this.logger;
    }

    writeLog(
        level: LoggerLevelType,
        reqId: string,
        message: string,
        { stackTraceLines, ...options }: MetaDataOptionsType = {}
    ) {
        options = JSON.parse(JSON.stringify(options));
        options.service_name = this.serviceName;

        if (options?.hasOwnProperty('message')) {
            // I don't remember why i force to put $message instead of message
            options.$message = options.message;
            delete options.message;
        }

        let lineTrace;
        if (this.lineTraceLevels.includes(level)) {
            const error = new Error(message); // must make Error right here
            const _stackTraceLines =
                stackTraceLines ??
                (typeof this.stackTraceLines === 'number' ? this.stackTraceLines : this.stackTraceLines?.[level]) ??
                1;

            lineTrace = getLineTrace(error, _stackTraceLines);
        }
        if (lineTrace) options.line_trace = lineTrace;

        // serverless logs got correctly from console
        if (this.runLocally) {
            return this.logger.log(level, message, { reqId, ...options });
        }

        const line = cloudWatchMessageFormatter({
            level,
            message,
            reqId,
            timestamp: new Date().toISOString(),
            ...options,
        });

        // @ts-ignore
        (console[level] ?? console.log)(line);
    }

    error(reqId: string | null, message: any, metadata: MetaDataOptionsType = {}) {
        this.writeLog(LOGGER_LEVEL.ERROR, reqId || REQUEST_ID, message, metadata);
    }

    warn(reqId: string | null, message: any, metadata: MetaDataOptionsType = {}) {
        this.writeLog(LOGGER_LEVEL.WARN, reqId || REQUEST_ID, message, metadata);
    }

    info(reqId: string | null, message: any, metadata: MetaDataOptionsType = {}) {
        this.writeLog(LOGGER_LEVEL.INFO, reqId || REQUEST_ID, message, metadata);
    }

    debug(reqId: string | null, message: any, metadata: MetaDataOptionsType = {}) {
        this.writeLog(LOGGER_LEVEL.DEBUG, reqId || REQUEST_ID, message, metadata);
    }

    verbose(reqId: string | null, message: any, metadata: MetaDataOptionsType = {}) {
        this.writeLog(LOGGER_LEVEL.VERBOSE, reqId || REQUEST_ID, message, metadata);
    }

    http(reqId: string | null, message: any, metadata: MetaDataOptionsType = {}) {
        this.writeLog(LOGGER_LEVEL.HTTP, reqId || REQUEST_ID, message, metadata);
    }

    silly(reqId: string | null, message: any, metadata: MetaDataOptionsType = {}) {
        this.writeLog(LOGGER_LEVEL.SILLY, reqId || REQUEST_ID, message, metadata);
    }

    child(options: Record<string, any>): LoggerType {
        return this.logger.child(options);
    }
}
