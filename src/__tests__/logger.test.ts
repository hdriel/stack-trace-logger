import { Logger } from '../logger';
export const logger = new Logger('UNIT_TEST');

describe('Logger level tests', function () {
    test('logger level logs', async () => {
        logger.error(null, 'TEST ERROR', { message: 'TEST ERROR' });
        logger.warn(null, 'TEST WARN', { message: 'TEST WARN' });
        logger.info(null, 'TEST INFO', { message: 'TEST INFO' });
        logger.debug(null, 'TEST DEBUG', { message: 'TEST DEBUG' });
        logger.verbose(null, 'TEST VERBOSE', { message: 'TEST VERBOSE' });
        logger.silly(null, 'TEST SILLY', { message: 'TEST SILLY' });
        logger.userAction(null, 'TEST USER_ACTION', { message: 'TEST USER_ACTION' });
    });
})


