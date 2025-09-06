import path from 'pathe';
import { rootPath } from 'get-root-path';

const __dirname = import.meta.dirname;

const ROOT_PATH = rootPath;
export const ROOT_LOGS_PATH = path.resolve(ROOT_PATH ?? __dirname, '..', 'logs');
console.log('ROOT_LOGS_PATH', ROOT_LOGS_PATH);
