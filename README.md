# traced-logger

[//]: # (### A lightweight logger with color and trace support.)
### A smart logger with tracing line, log level control, integrations with AWS CloudWatch and Seq, colorized and file logging.

## 📦 Installing

```bash
    npm install traced-logger
```

## ✨ Key Features

- Supports multiple log levels (DEBUG, INFO, ERROR, etc.) with colored console output
- Captures the exact location of the log call (file and line number)
- Automatically writes logs to files based on environment configuration
- Integrates with Seq for log management and monitoring
- Integrates with AWS CloudWatch with built-in Lambda compatibility
- Easy configuration using environment variables
- Supports creating multiple customized loggers using a class-based API

---

## 🛠  Usage

```ts
import Logger, { LOGGER_LEVEL } from 'traced-logger';

console.log('Hello World');
const logger = new Logger('UNIT_TEST', LOGGER_LEVEL.SILLY, [
    LOGGER_LEVEL.ERROR,
    LOGGER_LEVEL.WARN,
    LOGGER_LEVEL.INFO,
    // LOGGER_LEVEL.DEBUG,
    // LOGGER_LEVEL.HTTP,
    // LOGGER_LEVEL.VERBOSE,
    // LOGGER_LEVEL.SILLY,
]);

logger.error(null, 'TEST ERROR', { message: 'TEST ERROR' });
logger.warn(null, 'TEST WARN', { message: 'TEST WARN' });
logger.info(null, 'TEST INFO', { message: 'TEST INFO' });
logger.debug(null, 'TEST DEBUG', { message: 'TEST DEBUG' });
logger.verbose(null, 'TEST VERBOSE', { message: 'TEST VERBOSE' });
logger.http(null, 'TEST HTTP', { message: 'TEST HTTP' });
logger.silly(null, 'TEST SILLY', { message: 'TEST SILLY' });
```

---

# ⚙️ Environment Configuration for `traced-logger`

This document lists and describes all `process.env` variables used by the `traced-logger` package.  
Set these variables in your `.env` file or environment to control logging behavior, integrations, and runtime context.

---

## 🧠 Base Configuration

| Variable          | Description                                      | Example            |
|------------------|--------------------------------------------------|--------------------|
| `NODE_ENV`       | Current environment mode                         | `local`, `test`, `production` |
| `SERVICE_NAME`   | Name of the service for log tagging              | `SERVER`           |

---

## ✍ Logging Behavior

| Variable              | Description                                                   | Example             |
|----------------------|---------------------------------------------------------------|---------------------|
| `LOGGING_MODE`       | Minimum log level to display                                   | `debug`, `info`     |
| `LOGGING_LINE_TRACE` | Comma-separated levels that include line tracing in logs      | `error,info`        |

---

## 💾 Local File Logging

| Variable                | Description                                      | Example     |
|------------------------|--------------------------------------------------|-------------|
| `RUN_LOCALLY`          | Whether to run logger locally (enables file logs)| `1`         |
| `LOCAL_LOGS_DIR_PATH`  | Path to save log files                           | `./logs`    |

---

## 📡 Seq Integration

| Variable           | Description                                | Example                    |
|-------------------|--------------------------------------------|----------------------------|
| `LOGGER_USE_SEQ`  | Enable Seq logging                          | `1`                        |
| `LOGGING_KEY`     | Seq API key                                 | `BOVLE2HO7yVTHZ16rK7t`     |
| `LOGGING_URL`     | Seq server URL                              | `http://localhost:5341`    |

---

## ☁️ AWS CloudWatch Integration

| Variable                           | Description                                       | Example                |
|-----------------------------------|---------------------------------------------------|------------------------|
| `LOGGER_USE_CLOUDWATCH`          | Enable AWS CloudWatch logging                     | `1`                    |
| `LOGGER_CLOUDWATCH_GROUP_NAME`   | CloudWatch log group name                         | `/ecs/my-service`      |
| `LOGGER_CLOUDWATCH_STREAM_NAME`  | CloudWatch log stream name                        | `instance-logs`        |
| `LOGGER_CLOUDWATCH_RETENTION_IN_DAYS` | Number of days to retain logs in CloudWatch  | `3`                    |
| `AWS_ACCESS_KEY_ID`              | AWS access key ID                                 | `AKIA...`              |
| `AWS_SECRET_ACCESS_KEY`          | AWS secret access key                             | `abc123...`            |
| `AWS_REGION`                     | AWS region                                        | `us-east-1`            |
| `REMOTION_AWS_ACCESS_KEY_ID`     | Used if not in AWS Lambda (fallback key)          | `AKIA...`              |
| `REMOTION_AWS_SECRET_ACCESS_KEY` | Used if not in AWS Lambda (fallback secret)       | `abc123...`            |
| `REMOTION_AWS_REGION`            | Used if not in AWS Lambda                         | `us-east-1`            |

---

## 🔁 Serverless / Lambda Runtime Detection

| Variable                    | Description                                                  | Example    |
|----------------------------|--------------------------------------------------------------|------------|
| `IS_RUNNING_ON_SERVERLESS` | Explicit flag for Serverless environment                     | `true`     |
| `AWS_LAMBDA_FUNCTION_NAME` | Automatically set by AWS Lambda environment                  | (auto)     |
| `IS_OFFLINE`               | Used to detect Serverless Offline mode                       | `1` or `true` |

---

## ✅ Notes

- **Fallbacks:** When running locally, credentials fall back to `REMOTION_*` keys.
- **Lambda mode:** Auto-detected by presence of `AWS_LAMBDA_FUNCTION_NAME`, unless `IS_OFFLINE` is set.
- **Line trace levels:** Must match defined levels in `LOGGER_LEVEL`.

---

## 📊 [Seq](https://datalust.co/seq)

### Docker Compose

```yaml
version: '3.9'

volumes:
  seq-data: {}

networks:
  app-network:
    driver: bridge

services:
  admin-logger:
    image: datalust/seq:latest
    container_name: admin-logger
    environment:
      - ACCEPT_EULA=Y
      - SEQ_FIRSTRUN_ADMINUSERNAME=${LOGGING_USERNAME:-admin}
      - SEQ_FIRSTRUN_ADMINPASSWORD=${LOGGING_PASSWORD:-admin}
    volumes:
      - seq-data:/data  # Volume to persist Seq data
    ports:
      - ${LOGGING_PORT:-5341}:80
    networks:
      - app-network
```

```bash
  docker-compose up -d
```

## Seq usage

```env
    SEQ_URL=http://localhost:5341
    SEQ_API_KEY=your-api-key
```

🎥 Demo: [https://www.youtube.com/watch?v=SEQ_TUTORIAL_LINK](https://www.youtube.com/watch?v=SEQ_TUTORIAL_LINK)

---

## 🧪 Contributions

Contributions are welcome!
Feel free to open an issue or submit a pull request to help improve the project.

---

## 📜 License

MIT License
