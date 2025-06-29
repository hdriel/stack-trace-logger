# traced-logger

### A lightweight logger with color and trace support.


## 📦 Installing

```bash
    npm install traced-logger
```

# traced-logger

📦 A smart logger with tracing line, log level control, integrations with AWS CloudWatch and Seq, colorized and file logging.

---

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

## ⚙️ Environment Variable

| משתנה                   | תיאור                                        | ערך לדוגמה                          |
|-------------------------|-----------------------------------------------|-------------------------------------|
| `LOGGER_DIR_PATH`       | תיקייה מקומית לשמירת קובצי לוג               | `./logs`                            |
| `SEQ_URL`               | כתובת של שרת Seq                              | `http://localhost:5341`            |
| `SEQ_API_KEY`           | מפתח גישה ל־Seq (אם נדרש)                    | `your-seq-api-key`                 |
| `CLOUDWATCH_GROUP_NAME` | שם קבוצת הלוגים ב־CloudWatch                  | `my-service-logs`                  |
| `CLOUDWATCH_STREAM_NAME`| שם זרם הלוגים                                 | `instance-1`                       |
| `AWS_REGION`            | אזור AWS שבו מופעל CloudWatch                | `us-east-1`                         |
| `AWS_ACCESS_KEY_ID`     | מפתח גישה ל־AWS                               |                                     |
| `AWS_SECRET_ACCESS_KEY` | סיסמת גישה ל־AWS                              |                                     |
| `IS_LAMBDA`             | האם רץ בתוך Lambda (כדי לנהל CloudWatch אחרת)| `true` / `false`                   |

---

## 📊 Seq

[Seq](https://datalust.co/seq) הוא כלי לניטור לוגים עם UI עשיר.

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

### דוגמה לשימוש

```env
    SEQ_URL=http://localhost:5341
    SEQ_API_KEY=your-api-key
```

🎥 סרטון הסבר קצר: [https://www.youtube.com/watch?v=SEQ_TUTORIAL_LINK](https://www.youtube.com/watch?v=SEQ_TUTORIAL_LINK)

---

## ☁️ AWS CloudWatch

החבילה תומכת בשליחת לוגים גם ל־CloudWatch — בין אם מדובר בשירות רגיל או Lambda.

### במקרים של Lambda

יש להגדיר את:
```env
IS_LAMBDA=true
```

החבילה תזהה ותתאים את עצמה לשם זרם ייחודי עבור כל ריצה (`AWS_LAMBDA_LOG_STREAM_NAME`).

---


## 🧪 תרומות

מרגישים שיש מה לשפר? מוזמנים לשלוח Pull Request או לפתוח Issue.

---

## 📜 License

MIT License
