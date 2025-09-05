import path from 'pathe';

export const ENV_FILE_PATH = path.resolve(__dirname, '..', `.env.${process.env.NODE_ENV || 'local'}`);
