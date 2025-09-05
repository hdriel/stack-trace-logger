import path from 'pathe';

const __dirname = import.meta.dirname;
export const ROOT_LOGS_PATH = path.resolve(__dirname, '..', 'logs');
export const ENV_FILE_PATH = path.resolve(__dirname, '..', `.env.${process.env.NODE_ENV || 'local'}`);
