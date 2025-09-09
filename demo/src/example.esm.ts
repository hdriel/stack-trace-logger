import Logger, { LOGGER_LEVEL } from 'traced-logger';

console.log('Hello World');

DEFAULT_USE: {
    const logger = new Logger({
        serviceName: 'UNIT_TEST',
        lineTraceBack: 3,
        // transportDailyRotateFileOptions: { dirname: '../logs' },
        // transportSeqOptions: { serverUrl: 'https://localhost:5341', apiKey: 'xyz' },
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
    logger.info(null, 'TEST INFO', { message: 'TEST INFO', lineTraceBack: 2 });
    logger.debug(null, 'TEST DEBUG', { message: 'TEST DEBUG', lineTraceBack: 1 });
    logger.verbose(null, 'TEST VERBOSE', { message: 'TEST VERBOSE' });
    logger.http(null, 'TEST HTTP', { message: 'TEST HTTP' });
    logger.silly(null, 'TEST SILLY', { message: 'TEST SILLY' });
}

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
            LOGGER_LEVEL.SILLY,
        ],
        lineTraceBack: { error: 3, info: 2, warn: 3 },
        tags: ['reqId', 'userId?', 'project'],
    });

    const reqId = '0000-000-000-0000';
    logger.error(reqId, 'TEST ERROR', { message: 'TEST ERROR', userId: '1111', project: 'AAA', lineTraceBack: 1 });
    logger.warn(reqId, 'TEST WARN', { message: 'TEST WARN', userId: '1111', project: 'AAA' });
    logger.info(reqId, 'TEST INFO', { message: 'TEST INFO', project: 'AAA' });
    logger.debug(reqId, 'TEST DEBUG', { message: 'TEST DEBUG', userId: '1111', lineTraceBack: 3 });
    logger.verbose(reqId, 'TEST VERBOSE', { message: 'TEST VERBOSE', userId: '2222' });
    logger.http(reqId, 'TEST HTTP', { message: 'TEST HTTP', userId: '3333', project: 'AAA' });
    logger.silly(reqId, 'TEST SILLY', { message: 'TEST SILLY', userId: '1111' });
}
