import './dotenv';
import { LEVELS, LOGGER_LEVEL } from './consts';

export const envPrefix = process.env.NODE_ENV === 'test' ? 'TEST_' : ''; // jest set NODE_ENV automatically to 'test'

export const SERVICE_NAME = process.env.SERVICE_NAME || 'server';
export const NODE_ENV = process.env.NODE_ENV || 'local';
export const RUN_LOCALLY = !!(+(process.env.RUN_LOCALLY as string) || 0);
export const AWS_LAMBDA_FUNCTION_NAME = !!process.env.AWS_LAMBDA_FUNCTION_NAME; // # GOT FROM AWS LAMBDA ENVIRONMENTS
export const IS_RUNNING_ON_SERVERLESS = !!process.env.IS_RUNNING_ON_SERVERLESS || false; // # GOT FROM ENV SERVERLESS FILE
export const IS_OFFLINE = Boolean(+(['true', '1'].includes(process.env.IS_OFFLINE as string) ?? '0'));
if (IS_OFFLINE) process.env.IS_OFFLINE = 'true';
else delete process.env.IS_OFFLINE; // # MUST BE undefined or true - NOT false

export const IS_RUNNING_ON_AWS_LAMBDA = !!(AWS_LAMBDA_FUNCTION_NAME && !IS_OFFLINE);

export const AWS_ACCESS_KEY_ID = IS_RUNNING_ON_AWS_LAMBDA
    ? (process.env.AWS_ACCESS_KEY_ID as string) || 'xxxxxxxxx'
    : (process.env.REMOTION_AWS_ACCESS_KEY_ID as string);

export const AWS_SECRET_ACCESS_KEY = IS_RUNNING_ON_AWS_LAMBDA
    ? (process.env.AWS_SECRET_ACCESS_KEY as string) || 'xxxxxxxxx'
    : (process.env.REMOTION_AWS_SECRET_ACCESS_KEY as string);

export const AWS_REGION = IS_RUNNING_ON_AWS_LAMBDA
    ? (process.env.AWS_REGION as string) || 'xxxxxxxxx'
    : (process.env.REMOTION_AWS_REGION as string);

export const LOGGING_MODE = process.env[`${envPrefix}LOGGING_MODE`] as string;
const _LOGGING_LINE_TRACE = ((process.env[`${envPrefix}LOGGING_LINE_TRACE`] as string)?.split(',') ?? [
    LOGGER_LEVEL.error,
]) as LOGGER_LEVEL[];
export const LOGGING_LINE_TRACE = _LOGGING_LINE_TRACE
    .map((level) =>
        LEVELS[level] !== undefined
            ? LEVELS[level]
            : // @ts-ignore
              LOGGER_LEVEL[level] !== undefined
              ? // @ts-ignore
                LOGGER_LEVEL[level]
              : undefined
    )
    .filter((v) => v);

export const LOGGER_USE_SEQ = Boolean(+(process.env.LOGGER_USE_SEQ as string)) || undefined;
export const LOGGING_SEQ_KEY = (process.env[`${envPrefix}LOGGING_KEY`] as string) || undefined;
export const LOGGING_SEQ_HOST = (process.env[`${envPrefix}LOGGING_HOST`] as string) || 'localhost';
export const LOGGING_SEQ_PORT = (process.env[`${envPrefix}LOGGING_PORT`] as string) || 5341;
export const LOGGING_SEQ_USERNAME = (process.env[`${envPrefix}LOGGING_USERNAME`] as string) || undefined;
export const LOGGING_SEQ_PASSWORD = (process.env[`${envPrefix}LOGGING_PASSWORD`] as string) || undefined;
export const LOGGING_SEQ_URL = `http://${LOGGING_SEQ_HOST}:${LOGGING_SEQ_PORT}`;
export const SEQ_OPTIONS = LOGGER_USE_SEQ && {
    serverUrl: LOGGING_SEQ_URL,
    apiKey: LOGGING_SEQ_KEY,
};

export const LOGGER_USE_CLOUDWATCH = Boolean(+(process.env.LOGGER_USE_CLOUDWATCH as string)) || undefined;
export const LOGGER_CLOUDWATCH_GROUP_NAME = (process.env.LOGGER_CLOUDWATCH_GROUP_NAME as string) || 'default-group';
export const LOGGER_CLOUDWATCH_STREAM_NAME = (process.env.LOGGER_CLOUDWATCH_STREAM_NAME as string) || 'default-stream';
export const LOGGER_CLOUDWATCH_RETENTION_IN_DAYS = +(process.env.LOGGER_CLOUDWATCH_RETENTION_IN_DAYS as string) || 3;
export const CLOUDWATCH_OPTIONS = LOGGER_USE_CLOUDWATCH && {
    logGroupName: LOGGER_CLOUDWATCH_GROUP_NAME,
    logStreamName: LOGGER_CLOUDWATCH_STREAM_NAME,
    awsAccessKeyId: AWS_ACCESS_KEY_ID,
    awsSecretKey: AWS_SECRET_ACCESS_KEY,
    awsRegion: AWS_REGION,
    retentionInDays: LOGGER_CLOUDWATCH_RETENTION_IN_DAYS,
};
