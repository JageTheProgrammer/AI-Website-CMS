type Level = "info" | "warn" | "error" | "debug";

interface LogEntry {
  time: string;
  level: Level;
  msg: string;
  reqId?: string;
  [key: string]: unknown;
}

function formatEntry(entry: LogEntry): string {
  const parts: string[] = [
    `[${entry.time}]`,
    entry.level.toUpperCase().padEnd(5),
    entry.msg,
  ];
  if (entry.reqId) parts.push(`req=${entry.reqId}`);
  return parts.join(" ");
}

function write(level: Level, msg: string, meta?: Record<string, unknown>): void {
  const entry: LogEntry = { time: new Date().toISOString(), level, msg, ...meta };
  if (meta) {
    Object.assign(entry, meta);
  }
  const text = formatEntry(entry);
  if (level === "error") {
    console.error(text);
  } else {
    console.log(text);
  }
}

export const logger = {
  info: (msg: string, meta?: Record<string, unknown>) => write("info", msg, meta),
  warn: (msg: string, meta?: Record<string, unknown>) => write("warn", msg, meta),
  error: (msg: string, meta?: Record<string, unknown>) => write("error", msg, meta),
  debug: (msg: string, meta?: Record<string, unknown>) => write("debug", msg, meta),
};
