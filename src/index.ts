import { Logger } from './logger';
import { LOGGER_LEVEL } from './consts';

export default Logger;
export { LOGGER_LEVEL };

// const logger = new Logger();
// export default logger;

console.log('Hello World');
const logger = new Logger('UNIT_TEST', LOGGER_LEVEL.silly, [
    LOGGER_LEVEL.error,
    LOGGER_LEVEL.warn,
    LOGGER_LEVEL.info,
    LOGGER_LEVEL.debug,
    LOGGER_LEVEL.http,
    LOGGER_LEVEL.verbose,
    LOGGER_LEVEL.silly,
]);

logger.error(null, 'TEST ERROR', { message: 'TEST ERROR' });
logger.warn(null, 'TEST WARN', { message: 'TEST WARN' });
logger.info(null, 'TEST INFO', { message: 'TEST INFO' });
logger.debug(null, 'TEST DEBUG', { message: 'TEST DEBUG' });
logger.verbose(null, 'TEST VERBOSE', { message: 'TEST VERBOSE' });
logger.http(null, 'TEST HTTP', { message: 'TEST HTTP' });
logger.silly(null, 'TEST SILLY', { message: 'TEST SILLY' });
