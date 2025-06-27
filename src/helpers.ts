import { format, LogEntry, Logform } from 'winston';
import { NODE_ENV, IS_RUNNING_ON_SERVERLESS } from './environment-variables';
import { LoggerLevelType } from './consts';

interface PRINTF {
    request_id: string;
    timestamp: string;
    message: string;
    level: LoggerLevelType;
    [key: string]: any;
}

const colorizer = format.colorize();

export function stringifyMetaData(metadata: string | object = '') {
    if (!metadata || typeof metadata === 'string') return metadata;

    const metaDataStr = (key: string) => {
        const value = (<any>metadata)[key];
        const prettyValue = NODE_ENV === 'production' ? JSON.stringify(value) : JSON.stringify(value, null, 2);
        const valueStr = value && typeof value === 'object' ? prettyValue : value;

        return `${key}: ${valueStr}`;
    };

    return Object.keys(metadata).length
        ? `\n\t${Object.keys(metadata)
              .map(metaDataStr)
              .filter((v) => v)
              .join(',\n\t')}`
        : '';
}

// @ts-ignore
export const localMessageFormatter = ({
    timestamp,
    level,
    request_id,
    $message: message,
    message: _message,
    ...metadata
}: Logform.TransformableInfo | PRINTF): string => {
    if (IS_RUNNING_ON_SERVERLESS) {
        // https://www.brcline.com/blog/aws-lambda-logging-best-practices
        return `[${level}] [reqId: ${request_id}] ${message || _message} | ${stringifyMetaData(metadata)}`;
    }

    return colorizer.colorize(
        level,
        `${timestamp} [${level}] [${request_id}] ${message || _message} ${stringifyMetaData(metadata)}\n`
    );
};

export const cloudWatchMessageFormatter = ({
    timestamp,
    level,
    request_id,
    message,
    ...metadata
}: LogEntry | PRINTF): string => {
    return `[${level}] [reqId: ${request_id}] ${message} | ${stringifyMetaData(metadata)}`;
};

export const getLineTrace = (error: Error) => {
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
};
