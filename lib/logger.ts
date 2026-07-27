type LogLevel = "info" | "warn" | "error" | "debug";

interface LogContext {
  [key: string]: unknown;
}

function formatLog(level: LogLevel, message: string, context?: LogContext): string {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
  if (context && Object.keys(context).length > 0) {
    return `${prefix} ${message} ${JSON.stringify(context)}`;
  }
  return `${prefix} ${message}`;
}

export const logger = {
  info(message: string, context?: LogContext) {
    console.log(formatLog("info", message, context));
  },

  warn(message: string, context?: LogContext) {
    console.warn(formatLog("warn", message, context));
  },

  error(message: string, context?: LogContext) {
    console.error(formatLog("error", message, context));
  },

  debug(message: string, context?: LogContext) {
    if (process.env.NODE_ENV === "development") {
      console.debug(formatLog("debug", message, context));
    }
  },
};
