import '../utils/dotenv';
import { isDefined } from '../utils/helper';

export const envPrefix = process.env.NODE_ENV === 'test' ? 'TEST_' : ''; // jest set NODE_ENV automatically to 'test'

export const SERVICE_NAME = process.env.SERVICE_NAME || 'server';
export const NODE_ENV = process.env.NODE_ENV || 'local';
export const RUN_LOCALLY = !!(+(process.env.RUN_LOCALLY as string) || 0);

export const CLIENT_ENDPOINT = process.env.CLIENT_ENDPOINT as string;
export const CORS_WHITELIST = (process.env.CORS_WHITELIST ?? '').split(',');
export const VERIFY_IP_TOKEN = Boolean(+(process.env.VERIFY_IP_TOKEN as string)) || undefined;
export const DEFAULT_STREAMING_VIDEO_BUFFER_MB_SIZE =
    +(process.env.DEFAULT_STREAMING_VIDEO_BUFFER_MB_SIZE as string) || 5; // default 5MB
export const LIMITER_REQUESTS = +(process.env.LIMITER_REQUESTS as string) || 500; // default 500
export const LIMITER_TIMEOUT = +(process.env.LIMITER_TIMEOUT as string) || 1000 * 60 * 15; // default 15m

// REDIS VARIABLES
export const CACHE_IN_SECONDS_PROJECTS = isDefined(process.env.CACHE_IN_SECONDS_PROJECTS)
    ? +(process.env.CACHE_IN_SECONDS_PROJECTS as string)
    : undefined;
export const CACHE_IN_SECONDS_COURSES = isDefined(process.env.CACHE_IN_SECONDS_COURSES)
    ? +(process.env.CACHE_IN_SECONDS_COURSES as string)
    : undefined;
export const CACHE_IN_SECONDS_CHAPTERS = isDefined(process.env.CACHE_IN_SECONDS_CHAPTERS)
    ? +(process.env.CACHE_IN_SECONDS_CHAPTERS as string)
    : undefined;
export const CACHE_IN_SECONDS_USERS = isDefined(process.env.CACHE_IN_SECONDS_USERS)
    ? +(process.env.CACHE_IN_SECONDS_USERS as string)
    : undefined;
export const CACHE_IN_SECONDS_VIDEOS = isDefined(process.env.CACHE_IN_SECONDS_VIDEOS)
    ? +(process.env.CACHE_IN_SECONDS_VIDEOS as string)
    : undefined;
export const CACHE_IN_SECONDS_VIDEOS_USER_PERMISSION = isDefined(process.env.CACHE_IN_SECONDS_VIDEOS_USER_PERMISSION)
    ? +(process.env.CACHE_IN_SECONDS_VIDEOS_USER_PERMISSION as string)
    : undefined;
export const CACHE_IN_SECONDS_CHAPTER_RESOURCES_USER_PERMISSION = isDefined(
    process.env.CACHE_IN_SECONDS_CHAPTER_RESOURCES_USER_PERMISSION
)
    ? +(process.env.CACHE_IN_SECONDS_CHAPTER_RESOURCES_USER_PERMISSION as string)
    : undefined;
export const CACHE_IN_SECONDS_PRIVATE_RESOURCES_USER_PERMISSION = isDefined(
    process.env.CACHE_IN_SECONDS_PRIVATE_RESOURCES_USER_PERMISSION
)
    ? +(process.env.CACHE_IN_SECONDS_PRIVATE_RESOURCES_USER_PERMISSION as string)
    : undefined;

export const IGNORE_CACHING = Boolean(+(process.env.IGNORE_CACHING as string)) || undefined;
export const REDIS_HOST = (process.env[`${envPrefix}REDIS_HOST`] as string) || 'localhost';
export const REDIS_PORT = +(process.env[`${envPrefix}REDIS_PORT`] as string) || 6379;
export const REDIS_PASS = REDIS_HOST !== 'localhost' && (process.env[`${envPrefix}REDIS_PASS`] as string);
export const REDIS_INACTIVITY_USER_EXPIRE_IN =
    +(process.env[`${envPrefix}REDIS_INACTIVITY_USER_EXPIRE_IN`] as string) || 60 * 60 * 24;
export const REDIS_SETTINGS = {
    host: REDIS_HOST,
    port: REDIS_PORT,
    ...(REDIS_PASS && { password: REDIS_PASS }),
};

export const MONGO_HOST = (process.env[`${envPrefix}MONGO_HOST`] as string) || 'localhost';
export const MONGO_DB = process.env[`${envPrefix}MONGO_DB`] as string;
export const MONGO_USER = process.env[`${envPrefix}MONGO_USER`] as string;
export const MONGO_PASSWORD = process.env[`${envPrefix}MONGO_PASSWORD`] as string;
export const MONGO_PORT = +(process.env[`${envPrefix}MONGO_PORT`] as string) || 27017;
export const MONGO_URL = ((process.env[`${envPrefix}MONGO_URL`] as string) || undefined)
    ?.replace('mongodb://:@', 'mongodb://')
    .replace('mongodb://@:', 'mongodb://');
export const MONGO_SETTINGS = MONGO_URL || {
    database: MONGO_DB,
    user: MONGO_USER,
    password: MONGO_PASSWORD,
    port: MONGO_PORT,
    host: MONGO_HOST,
};

export const PGADMIN_PORT = +(process.env[`${envPrefix}PGADMIN_PORT`] as string) || 5050;
export const PGADMIN_DEFAULT_EMAIL = (process.env[`${envPrefix}PGADMIN_DEFAULT_EMAIL`] as string) || 'root@domain.com';
export const PGADMIN_DEFAULT_PASSWORD = (process.env[`${envPrefix}PGADMIN_DEFAULT_PASSWORD`] as string) || 'password';

export const RABBITMQ_HOST = (process.env.RABBITMQ_HOST as string) || 'localhost';
export const RABBITMQ_USERNAME = (process.env.RABBITMQ_USERNAME as string) || 'guest';
export const RABBITMQ_PASSWORD = (process.env.RABBITMQ_PASSWORD as string) || 'guest';
export const RABBITMQ_DEFAULT_USER = (process.env.RABBITMQ_DEFAULT_USER as string) || 'guest';
export const RABBITMQ_DEFAULT_PASS = (process.env.RABBITMQ_DEFAULT_PASS as string) || 'guest';
export const RABBITMQ_PORT = +(process.env.RABBITMQ_PORT as string) || 5672;
export const RABBITMQ_RECOVERY_TIME_SEC = +(process.env.RABBITMQ_RECOVERY_TIME_SEC as string) || 10;
export const RABBITMQ_URL = process.env.RABBITMQ_URL as string;
export const RABBIT_SETTINGS = RABBITMQ_URL || {
    protocol: 'amqp',
    hostname: RABBITMQ_HOST,
    port: RABBITMQ_PORT,
    username: RABBITMQ_USERNAME,
    password: RABBITMQ_PASSWORD,
    vhost: '/',
    authMechanism: ['PLAIN', 'AMQPLAIN', 'EXTERNAL'],
};

export const DOCKER_NAME_LOCALSTACK = (process.env.DOCKER_NAME_LOCALSTACK as string) || 'localstack-jlt';
export const AWS_LOCALSTACK_HOST = (process.env.AWS_LOCALSTACK_HOST as string) || 'localhost';
export const AWS_ENDPOINT = process.env.AWS_ENDPOINT as string; // || 'http://localhost:4566';
export const AWS_TOPIC_ARN_EMAIL = process.env.AWS_TOPIC_ARN_EMAIL as string as string;
export const AWS_PRIVATE_RESOURCES_BUCKET_NAME = process.env.AWS_PRIVATE_RESOURCES_BUCKET_NAME as string;
export const AWS_PUBLIC_GRID_GUIDE_RESOURCES_BUCKET_NAME = process.env
    .AWS_PUBLIC_GRID_GUIDE_RESOURCES_BUCKET_NAME as string;
export const AWS_PUBLIC_RESOURCES_BUCKET_NAME = process.env.AWS_PUBLIC_RESOURCES_BUCKET_NAME as string;
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

export const AWS_SESSION_TOKEN = IS_RUNNING_ON_AWS_LAMBDA
    ? (process.env.AWS_SESSION_TOKEN as string)
    : (process.env.REMOTION_AWS_SESSION_TOKEN as string);

export const MAX_LAST_PASSWORD = +(process.env[`${envPrefix}MAX_LAST_PASSWORD`] as string) ?? 3;

export const WHATSAPP_NUMBER = process.env.WHATSAPP_NUMBER;
export const TWILIO_PHONE = process.env.TWILIO_PHONE;
export const TWILIO_WHATSAPP = process.env.TWILIO_WHATSAPP;
export const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
export const TWILIO_TOKEN = process.env.TWILIO_TOKEN;

export const EMAIL_HOST = process.env.EMAIL_HOST;
export const EMAIL_PORT = process.env.EMAIL_PORT;
export const EMAIL_USER = process.env.EMAIL_USER;
export const EMAIL_PASS = process.env.EMAIL_PASS;
export const EMAIL_FROM = process.env.EMAIL_FROM;

export const SMS_CONSUMER_HOST = process.env.SMS_CONSUMER_HOST;
export const SMS_CONSUMER_PORT = process.env.SMS_CONSUMER_PORT;
export const SMS_CONSUMER_URL = `http://${SMS_CONSUMER_HOST}:${SMS_CONSUMER_PORT}`;

export const WHATSAPP_CONSUMER_HOST = process.env.WHATSAPP_CONSUMER_HOST;
export const WHATSAPP_CONSUMER_PORT = process.env.WHATSAPP_CONSUMER_PORT;
export const WHATSAPP_CONSUMER_URL = `http://${WHATSAPP_CONSUMER_HOST}:${WHATSAPP_CONSUMER_PORT}`;

export const TELEGRAM_NOTIFICATION_CHAT_IDS =
    process.env.TELEGRAM_NOTIFICATION_CHAT_IDS?.split(',').filter((v) => v) || [];
export const TELEGRAM_NOTIFICATION_TOKEN = process.env.TELEGRAM_NOTIFICATION_TOKEN;
export const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
export const SLS_TELEGRAM_WEBHOOK_API = process.env.SLS_TELEGRAM_WEBHOOK_API;
export const TELEGRAM_HOST = process.env.TELEGRAM_HOST;
export const TELEGRAM_PORT = process.env.TELEGRAM_PORT;
export const TELEGRAM_CONSUMER_URL = `http://${TELEGRAM_HOST}:${TELEGRAM_PORT}`;
export const TELEGRAM_NOTIFICATION_BOT = process.env.TELEGRAM_NOTIFICATION_BOT as string;

export const SLS_WHASTAPP_DOMAIN_API = process.env.SLS_WHASTAPP_DOMAIN_API as string;

export const MAILER_CONSUMER_HOST = process.env.MAILER_CONSUMER_HOST;
export const MAILER_CONSUMER_PORT = process.env.MAILER_CONSUMER_PORT;
export const MAILER_CONSUMER_URL = `http://${MAILER_CONSUMER_HOST}:${MAILER_CONSUMER_PORT}`;

export const SHORT_TOKEN_EXPIRED = process.env.SHORT_TOKEN_EXPIRED || '1d';
export const LONG_TOKEN_EXPIRED = process.env.LONG_TOKEN_EXPIRED || '30d';

export const LOGGING_MODE = process.env[`${envPrefix}LOGGING_MODE`] as string;
export const LOGGING_LINE_TRACE = (process.env[`${envPrefix}LOGGING_LINE_TRACE`] as string)?.split(',') ?? ['error'];

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
