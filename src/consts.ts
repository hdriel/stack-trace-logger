import { NIL } from 'uuid';

export const REQUEST_ID = NIL;

export const LOGGER_LEVEL = {
    ERROR: 'error',
    WARN: 'warn',
    INFO: 'info',
    DEBUG: 'debug',
    HTTP: 'http',
    VERBOSE: 'verbose',
    SILLY: 'silly',
} as const;

export type LoggerLevelType = (typeof LOGGER_LEVEL)[keyof typeof LOGGER_LEVEL];

export const LEVELS = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    verbose: 4,
    debug: 5,
    silly: 6,
};
