"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Runner = void 0;
const node_perf_hooks_1 = require("node:perf_hooks");
const axios_1 = __importDefault(require("axios"));
const logger_1 = __importDefault(require("./logger"));
const SlackNotify = {
    stats: async function (params) {
        const { webhookUrl, subject, durationMs, executionCount, successCount, errorCount, } = params;
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
        await axios_1.default.post(webhookUrl, payload);
    },
    progress: async function (params) {
        const { webhookUrl, subject, type } = params;
        const choose = {
            "start": ":large_green_circle:",
            "end": ":red_circle:"
        };
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
        await axios_1.default.post(webhookUrl, payload);
    },
    error: async function (params) {
        const { webhookUrl, subject } = params;
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
        await axios_1.default.post(webhookUrl, payload);
    },
};
let counter = 0;
let programLength = 0;
let errorCount = 0;
let successCount = 0;
const baton = { data: {} };
function boundary() {
    if (counter !== programLength) {
        console.log(" ".repeat(35) + "┃");
        console.log(" ".repeat(35) + "┃");
    }
}
function ts() {
    const now = new Date();
    return now.toISOString();
}
async function capture_console(fn) {
    const originalLog = console.log;
    const originalInfo = console.info;
    const originalError = console.error;
    const logs = [];
    console.log = (...args) => {
        const message = args
            .map(arg => {
            if (typeof arg === "object") {
                try {
                    return "Object:\n" + JSON.stringify(arg, null, 2);
                }
                catch {
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
    console.info = (...args) => {
        const message = args
            .map(arg => {
            if (typeof arg === "object") {
                try {
                    return "Object:\n" + JSON.stringify(arg, null, 2);
                }
                catch {
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
    console.error = (...args) => {
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
    }
    catch (err) {
        if (typeof err !== "object") {
            err = new Error(err.toString());
        }
        err.runner = { logs };
        throw err;
    }
    finally {
        console.log = originalLog;
        console.info = originalInfo;
        console.error = originalError;
    }
    return { logs };
}
function handle_internals(logs) {
    if (logs.length) {
        logger_1.default.plain_dark("├" + "╌".repeat(69) + "┤");
        logger_1.default.info("Internal logs:");
        logs.forEach((log) => {
            if (log.type === "log") {
                logger_1.default.muted(log.message, { indent: 3 });
            }
            else if (log.type === "info") {
                logger_1.default.info(log.message, { indent: 3 });
            }
            else if (log.type === "error") {
                logger_1.default.danger(log.message, { indent: 3 });
            }
        });
    }
    logger_1.default.plain_dark("└" + "─".repeat(69) + "┘");
}
async function measure(v, options = {}) {
    const start = node_perf_hooks_1.performance.now();
    const { slackWebhookUrl } = options;
    logger_1.default.plain_dark("┌" + "─".repeat(69) + "┐");
    try {
        const { logs } = await capture_console(v.executor);
        const end = node_perf_hooks_1.performance.now();
        logger_1.default.muted(`Execution time: ${(end - start).toFixed(3)} ms`);
        logger_1.default.success("Success: " + v.subject);
        handle_internals(logs);
        boundary();
        counter++;
        successCount++;
    }
    catch (err) {
        const end = node_perf_hooks_1.performance.now();
        logger_1.default.muted(`Execution time: ${(end - start).toFixed(3)} ms`);
        logger_1.default.warning("Error: " + v.subject, { bold: true });
        logger_1.default.danger(err.stack || err.toString(), { indent: 2 });
        if (err && err.runner) {
            const { logs } = err.runner;
            handle_internals(logs);
        }
        boundary();
        counter++;
        errorCount++;
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
__exportStar(require("./runner.i"), exports);
class Runner {
    static async go(program, options = {}) {
        const { slackWebhookUrl, name } = options;
        programLength = program.length - 1;
        const start = node_perf_hooks_1.performance.now();
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
        const end = node_perf_hooks_1.performance.now();
        console.log(" ".repeat(35) + "║║");
        console.log(" ".repeat(35) + "║║");
        const report = {
            duration: (end - start).toFixed(3),
            count: programLength + 1,
            successCount,
            errorCount
        };
        logger_1.default.plain_bright("╔" + "═".repeat(30) + " Summary " + "═".repeat(30) + "╗");
        logger_1.default.plain_bright(`  ┎ Total duration: ${report.duration} ms`, { bold: true });
        logger_1.default.plain_bright(`  ┣ Total executions: ${report.count}`, { bold: true });
        logger_1.default.plain_bright(`  ┣ Total success: ${report.successCount}`, { bold: true });
        logger_1.default.plain_bright(`  ┖ Total errors: ${report.errorCount}`, { bold: true });
        logger_1.default.plain_bright("╚" + "═".repeat(69) + "╝");
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
exports.Runner = Runner;
//# sourceMappingURL=runner.js.map