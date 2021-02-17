import { logger, LogSeverity } from 'af-utilities';

import { appConfig } from './config';

export interface OutputData {
  message: string;
  severity?: LogSeverity;
  indentChange?: number; // positive, zero, negative
  exitCode?: number; // any positive cause app to exit
}
const OUTPUT_DEFAULT_SEVERITY = LogSeverity.Informational;
const OUTPUT_DEFAULT_INDENT_CHANGE = 0;
const OUTPUT_DEFAULT_EXIT_CODE = 0;

export const OUTPUT_INCREASE_INDENT: Readonly<OutputData> = {
  message: '',
  indentChange: 1,
};
export const OUTPUT_DECREASE_INDENT: Readonly<OutputData> = {
  message: '',
  indentChange: -1,
};

let indentLevel = 0;
const OUTPUT_DEFAULT_PADDING = '  ';

function getIndentPadding(indentChange: number | undefined): string {
  if (!indentChange) indentChange = OUTPUT_DEFAULT_INDENT_CHANGE;
  if (indentChange !== 0) {
    if (indentChange > 0) {
      indentLevel += 1;
    } else {
      indentLevel -= 1;
      if (indentLevel < 0) indentLevel = 0;
    }
  }
  return OUTPUT_DEFAULT_PADDING.repeat(indentLevel);
}

function getSeverityLevel(severity: LogSeverity | undefined): LogSeverity {
  if (!severity) return OUTPUT_DEFAULT_SEVERITY;
  return severity;
}

function getExitCode(exitCode: number | undefined): number {
  if (!exitCode) return OUTPUT_DEFAULT_EXIT_CODE;
  return exitCode;
}

export function showOutput(data: OutputData | string): void {
  if (typeof data === 'string') {
    const message = data;
    data = {
      message: message,
    };
  }
  const padding = getIndentPadding(data.indentChange);

  // This allows you to change the indentLevel but not output anything.
  // This can be useful to allow a calling party to adjust the output for
  // the called producer.
  if (data.message.length === 0) return;

  let message = `${padding}${data.message}`;
  switch (getSeverityLevel(data.severity)) {
    case LogSeverity.Error:
      message = `${appConfig.loggingHeaders.error} ${message}`;
      logger.error(message);
      break;

    case LogSeverity.Debug:
      message = `${appConfig.loggingHeaders.debug} ${message}`;
      logger.debug(message);
      break;

    default:
      logger.info(message);
  }
  if (getExitCode(data.exitCode) !== 0) {
    process.exit(data.exitCode);
  }
}
