import { NIL } from 'uuid';

export const REQUEST_ID = NIL;

export const enum LOGGER_LEVEL {
    error = 'error',
    warn = 'warn',
    info = 'info',
    debug = 'debug',
    http = 'http',
    verbose = 'verbose',
    silly = 'silly',
}

export const LEVELS = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    verbose: 4,
    debug: 5,
    silly: 6,
};
