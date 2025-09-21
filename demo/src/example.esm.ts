import Logger, { LOGGER_LEVEL } from 'stack-trace-logger';

console.log('Hello World');

TAG_PROPS: {
    const logger = new Logger({
        serviceName: 'UNIT_TEST',
        loggingModeLevel: LOGGER_LEVEL.SILLY,
        lineTraceLevels: [
            LOGGER_LEVEL.ERROR,
            LOGGER_LEVEL.WARN,
            LOGGER_LEVEL.INFO,
            LOGGER_LEVEL.DEBUG,
            LOGGER_LEVEL.HTTP,
            LOGGER_LEVEL.VERBOSE,
            // LOGGER_LEVEL.SILLY,
        ],
        stackTraceLines: { error: 3, info: 2, warn: 3 },
        tags: ['reqId', '*userId?', 'project'],
    });

    const reqId = '0000-000-000-0000';
    logger.error(reqId, 'TEST ERROR', { message: 'TEST ERROR', userId: '1111', project: 'AAA', stackTraceLines: 1 });
    logger.warn(reqId, 'TEST WARN', { message: 'TEST WARN', userId: '1111', project: 'AAA' });
    logger.info(reqId, 'TEST INFO', { message: 'TEST INFO', project: 'AAA' });
    logger.debug(reqId, 'TEST DEBUG', { message: 'TEST DEBUG', userId: '1111', stackTraceLines: 3 });
    logger.verbose(reqId, 'TEST VERBOSE', { message: 'TEST VERBOSE', userId: '2222' });
    logger.http(reqId, 'TEST HTTP', { message: 'TEST HTTP', userId: '3333', project: 'AAA' });
    logger.silly(reqId, 'TEST SILLY', { message: 'TEST SILLY', userId: '1111' });
}
