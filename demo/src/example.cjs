const { Logger, LOGGER_LEVEL } = require('stack-trace-logger');

console.log('Hello World');

let logger = new Logger({
    serviceName: 'UNIT_TEST',
    loggingModeLevel: LOGGER_LEVEL.SILLY,
    lineTraceLevels: [
        LOGGER_LEVEL.ERROR,
        LOGGER_LEVEL.WARN,
        LOGGER_LEVEL.INFO,
        LOGGER_LEVEL.DEBUG,
        LOGGER_LEVEL.HTTP,
        LOGGER_LEVEL.VERBOSE,
        LOGGER_LEVEL.SILLY,
    ],
});

logger.error(null, 'TEST ERROR', { message: 'TEST ERROR' });
logger.warn(null, 'TEST WARN', { message: 'TEST WARN' });
logger.info(null, 'TEST INFO', { message: 'TEST INFO' });
logger.debug(null, 'TEST DEBUG', { message: 'TEST DEBUG' });
logger.verbose(null, 'TEST VERBOSE', { message: 'TEST VERBOSE' });
logger.http(null, 'TEST HTTP', { message: 'TEST HTTP' });
logger.silly(null, 'TEST SILLY', { message: 'TEST SILLY' });

logger = new Logger({
    serviceName: 'UNIT_TEST',
    loggingModeLevel: LOGGER_LEVEL.SILLY,
    lineTraceLevels: [
        LOGGER_LEVEL.ERROR,
        LOGGER_LEVEL.WARN,
        LOGGER_LEVEL.INFO,
        LOGGER_LEVEL.DEBUG,
        LOGGER_LEVEL.HTTP,
        LOGGER_LEVEL.VERBOSE,
        LOGGER_LEVEL.SILLY,
    ],
    tags: ['reqId', 'userId?', 'project'],
});

const reqId = '0000-000-000-0000';
logger.error(reqId, 'TEST ERROR', { message: 'TEST ERROR', userId: '1111', project: 'AAA' });
logger.warn(reqId, 'TEST WARN', { message: 'TEST WARN', userId: '1111', project: 'AAA' });
logger.info(reqId, 'TEST INFO', { message: 'TEST INFO', project: 'AAA' });
logger.debug(reqId, 'TEST DEBUG', { message: 'TEST DEBUG', userId: '1111' });
logger.verbose(reqId, 'TEST VERBOSE', { message: 'TEST VERBOSE', userId: '2222' });
logger.http(reqId, 'TEST HTTP', { message: 'TEST HTTP', userId: '3333', project: 'AAA' });
logger.silly(reqId, 'TEST SILLY', { message: 'TEST SILLY', userId: '1111' });
