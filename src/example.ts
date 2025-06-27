import Logger, { LOGGER_LEVEL } from './index';

console.log('Hello World');
const logger = new Logger('UNIT_TEST', LOGGER_LEVEL.SILLY, [
    LOGGER_LEVEL.ERROR,
    LOGGER_LEVEL.WARN,
    LOGGER_LEVEL.INFO,
    LOGGER_LEVEL.DEBUG,
    LOGGER_LEVEL.HTTP,
    LOGGER_LEVEL.VERBOSE,
    LOGGER_LEVEL.SILLY,
]);

logger.error(null, 'TEST ERROR', { message: 'TEST ERROR' });
logger.warn(null, 'TEST WARN', { message: 'TEST WARN' });
logger.info(null, 'TEST INFO', { message: 'TEST INFO' });
logger.debug(null, 'TEST DEBUG', { message: 'TEST DEBUG' });
logger.verbose(null, 'TEST VERBOSE', { message: 'TEST VERBOSE' });
logger.http(null, 'TEST HTTP', { message: 'TEST HTTP' });
logger.silly(null, 'TEST SILLY', { message: 'TEST SILLY' });
