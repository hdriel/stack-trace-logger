import path from 'path';

export const ENV_FILE_PATH = path.resolve(
    __dirname,
    '../../',
    `.env.${process.env.NODE_ENV || 'local'}`
);

export const LOG_DIR_PATH = path.resolve(__dirname, '../../', 'logs');

