import { format, type LogEntry } from 'winston';
import { type LoggerLevelType, NODE_ENV } from './consts';
import type { TransformableInfo } from 'logform';

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

export const localMessageFormatter = (
    {
        colorize: colorize,
        timestamp,
        level,
        $message: message,
        message: _message,
        ...metadata
    }: TransformableInfo | PRINTF,
    tagProps: string[] = []
): string => {
    const output = [
        `[${level}]`,
        ...tagProps
            .filter((tag) => metadata[tag.replace('?', '')] || !tag.endsWith('?'))
            .map((_tag) => {
                const tag = _tag.replace('?', '');
                return `[${tag}: ${metadata[tag]}]`;
            }),
        message || _message,
        '|',
        `${stringifyMetaData(metadata)}`,
    ]
        .filter((v) => !!v)
        .join(' ');

    if (colorize) {
        return colorizer.colorize(level, `${timestamp} ${output}\n`);
    }

    // https://www.brcline.com/blog/aws-lambda-logging-best-practices
    return output;
};

export const cloudWatchMessageFormatter = (
    { timestamp, level, message, ...metadata }: LogEntry | PRINTF,
    tagProps: string[] = []
): string => {
    return [
        `[${level}]`,
        ...tagProps
            .filter((tag) => !tag.endsWith('?') && metadata[tag.replace('?', '')])
            .map((_tag) => {
                const tag = _tag.replace('?', '');
                return `[${tag}: ${metadata[tag]}]`;
            }),
        message,
        '|',
        `${stringifyMetaData(metadata)}`,
    ]
        .filter((v) => !!v)
        .join(' ')
        .replace(/\n/g, '\r');
};

export const getLineTrace = (error: Error, lineCounter = 1) => {
    const startLoggerFileLineRegex = /^\s*at Logger\./;
    const lineTraces = error?.stack?.split('\n').filter((line) => !startLoggerFileLineRegex.test(line.trim())) || [];

    const lines: string[] = [];
    let lineTrace = lineTraces[1];

    for (const line of lineTraces.slice(1)) {
        const isLoggerFile = startLoggerFileLineRegex.test(line.trim());
        if (!isLoggerFile) {
            lineTrace = line;
            lines.push(lineTrace);
            lineCounter--;
            if (!lineCounter) break;
        }
    }

    return lines.join('\n\r\t\t').trimStart();
};
