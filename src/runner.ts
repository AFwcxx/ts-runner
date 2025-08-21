"use strict";

import { performance } from "node:perf_hooks";
import axios from "axios";
import { GoOptions, Process, Baton, SlackStatOptions, SlackProgressOptions } from "./runner.i";
import Logger from "./logger";



const SlackNotify = {
  stats: async function (params: SlackStatOptions) {
    const {
      webhookUrl,
      subject,
      durationMs,
      executionCount,
      successCount,
      errorCount,
    } = params;

    const clock = "⏱";
    const list = "📊";
    const check = "✅";
    const cross = "❌";

    const payload = {
      text: `Runner task report for *${subject}*`,
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: `📢 Runner task report: ${subject}`,
            emoji: true,
          },
        },
        { type: "divider" },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*${clock} Duration:*\n${durationMs} ms`,
            },
            {
              type: "mrkdwn",
              text: `*${list} Total Executions:*\n${executionCount}`,
            },
            {
              type: "mrkdwn",
              text: `*${check} Success:*\n${successCount}`,
            },
            {
              type: "mrkdwn",
              text: `*${cross} Failures:*\n${errorCount}`,
            },
          ],
        },
      ],
    };

    await axios.post(webhookUrl, payload);
  },
  progress: async function (params: SlackProgressOptions) {
    const {
      webhookUrl,
      subject,
      type
    } = params;

    const choose = {
      "start": ":large_green_circle:",
      "end": ":red_circle:"
    }

    const payload = {
      text: `Runner task ${type} for *${subject}*`,
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: `${choose[type]} Runner task ${type}: ${subject}`,
            emoji: true,
          },
        }
      ],
    };

    await axios.post(webhookUrl, payload);
  },
  error: async function (params: SlackProgressOptions) {
    const {
      webhookUrl,
      subject
    } = params;

    const payload = {
      text: `Runner task error exit for *${subject}*`,
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: `:warning: Runner task error exit: ${subject}`,
            emoji: true,
          },
        }
      ],
    };

    await axios.post(webhookUrl, payload);
  },
}

let counter = 0;
let programLength = 0;
let errorCount = 0;
let successCount = 0;

const baton: Baton = { data: {} };

function boundary(): void {
  if (counter !== programLength) {
    console.log(" ".repeat(35) + "┃");
    console.log(" ".repeat(35) + "┃");
  }
}

function ts() {
  const now = new Date();
  return now.toISOString();
}

interface InternalLog {
  type: "log" | "info" | "error";
  message: string;
}

async function capture_console(
  fn: Function
): Promise<{
  logs: Array<InternalLog>;
}> {
  const originalLog = console.log;
  const originalInfo = console.info;
  const originalError = console.error;

  const logs: Array<InternalLog> = [];

  console.log = (...args: any[]) => {
    const message = args
      .map(arg => {
        if (typeof arg === "object") {
          try {
            return "Object:\n" + JSON.stringify(arg, null, 2);
          } catch {
            return String(arg);
          }
        }
        return String(arg);
      })
      .join(" ");

    logs.push({
      type: "log",
      message: `${ts()}: ` + message
    });
  };

  console.info = (...args: any[]) => {
    const message = args
      .map(arg => {
        if (typeof arg === "object") {
          try {
            return "Object:\n" + JSON.stringify(arg, null, 2);
          } catch {
            return String(arg);
          }
        }
        return String(arg);
      })
      .join(" ");

    logs.push({
      type: "info",
      message: `${ts()}: ` + message
    });
  };

  console.error = (...args: any[]) => {
    const message = args
      .map(arg => {
        if (arg instanceof Error) {
          return arg.stack || arg.toString();
        }
        return typeof arg === "object"
          ? JSON.stringify(arg, null, 2)
          : String(arg);
      })
      .join(" ");

    const fakeError = new Error();
    const stack = fakeError.stack
      ? fakeError.stack.split("\n").slice(2).join("\n")
      : "";

    logs.push({
      type: "error",
      message: `${ts()}: ` + message + (stack ? "\n" + stack : "")
    });
  };

  try {
    const executed = fn(baton);

    if (executed instanceof Promise) {
      await executed;
    }
  } catch (err: any) {
    if (!(err instanceof Error)) {
        err = new Error(String(err));
    }
    // attach extra info without clobbering original stack
    Object.assign(err, { runner: { logs } });
    throw err;
  } finally {
    console.log = originalLog;
    console.info = originalInfo;
    console.error = originalError;
  }

  return { logs };
}

function handle_internals(logs: Array<InternalLog>) {
  if (logs.length) {
    Logger.plain_dark("├" + "╌".repeat(69) + "┤");
    Logger.info("Internal logs:");

    logs.forEach((log: InternalLog) => {
      if (log.type === "log") {
        Logger.muted(log.message, { indent: 3 })
      } else if (log.type === "info") {
        Logger.info(log.message, { indent: 3 })
      } else if (log.type === "error") {
        Logger.danger(log.message, { indent: 3 })
      }
    });
  }

  Logger.plain_dark("└" + "─".repeat(69) + "┘");
}

async function measure(v: Process, options: {
  slackWebhookUrl?: string;
} = {}): Promise<void> {
  const start = performance.now();
  const { slackWebhookUrl } = options;

  Logger.plain_dark("┌" + "─".repeat(69) + "┐");

  try {
    const { logs } = await capture_console(v.executor);

    const end = performance.now();
    Logger.muted(`Execution time: ${(end - start).toFixed(3)} ms`);
    Logger.success("Success: " + v.subject);
    handle_internals(logs);
    boundary();
    counter++;
    successCount++;
  } catch (err: any) {
    const end = performance.now();
    Logger.muted(`Execution time: ${(end - start).toFixed(3)} ms`);
    Logger.warning("Error: " + v.subject, { bold: true });
    Logger.danger(err.stack || err.toString(), { indent: 2 });
    if (err && err.runner) {
      const { logs } = err.runner;
      handle_internals(logs);
    }
    boundary();
    counter++;
    errorCount++;

    // Terminate!
    if (v.exitOnError) {
      if (slackWebhookUrl) {
        await SlackNotify.error({
          webhookUrl: slackWebhookUrl,
          subject: v.subject,
          type: "start"
        });
      }

      process.exit(1);
    }
  }

}

export * from "./runner.i";
export class Runner {
  static async go(program: Array<Process>, options: GoOptions = {}): Promise<Record<string,any>> {
    const { slackWebhookUrl, name } = options;

    programLength = program.length - 1;

    const start = performance.now();

    for (const v of program) {
      if (v.activate || v.activate === undefined) {
        if (v.notifyOnStart && slackWebhookUrl) {
          await SlackNotify.progress({
            webhookUrl: slackWebhookUrl,
            subject: v.subject,
            type: "start"
          });
        }

        await measure(v, { slackWebhookUrl });

        if (v.notifyOnEnd && slackWebhookUrl) {
          await SlackNotify.progress({
            webhookUrl: slackWebhookUrl,
            subject: v.subject,
            type: "end"
          });
        }
      }
    }

    const end = performance.now();

    console.log(" ".repeat(35) + "║║");
    console.log(" ".repeat(35) + "║║");

    const report = {
      duration: (end - start).toFixed(3),
      count: programLength + 1,
      successCount,
      errorCount
    };

    Logger.plain_bright("╔" + "═".repeat(30) + " Summary " + "═".repeat(30) + "╗")
    Logger.plain_bright(`  ┎ Total duration: ${report.duration} ms`, { bold: true });
    Logger.plain_bright(`  ┣ Total executions: ${report.count}`, { bold: true });
    Logger.plain_bright(`  ┣ Total success: ${report.successCount}`, { bold: true });
    Logger.plain_bright(`  ┖ Total errors: ${report.errorCount}`, { bold: true });
    Logger.plain_bright("╚" + "═".repeat(69) + "╝")

    if (slackWebhookUrl) {
      await SlackNotify.stats({
        webhookUrl: slackWebhookUrl,
        subject: name || "N/A",
        durationMs: report.duration,
        executionCount: report.count,
        successCount, errorCount
      });
    }

    return report;
  }
}
