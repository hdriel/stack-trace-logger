import dotenv from 'dotenv';
import { expand } from 'dotenv-expand';
import { ENV_FILE_PATH } from './paths';

console.debug('ENV_FILE_PATH', ENV_FILE_PATH);
const myEnv = dotenv.config({ path: ENV_FILE_PATH });
expand(myEnv);

export default myEnv.parsed;
