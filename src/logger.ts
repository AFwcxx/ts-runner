"use strict";

import chalk from "chalk";

type Variant = "plain_bright" | "plain_dark" | "info" | "success" | "warning" | "danger" | "muted";

interface LogOptions {
  indent?: number;
  bold?: boolean;
  time?: boolean;
  bg?: boolean;
}

export default class Logger {
  private static variants: Record<
    Variant,
    { color: any; bgColor: any; icon: string }
  > = {
    plain_bright:    { color: chalk.whiteBright, bgColor: chalk.bgWhiteBright, icon: "" },
    plain_dark:    { color: chalk.grey, bgColor: chalk.bgGrey, icon: "" },
    info:    { color: chalk.cyan, bgColor: chalk.bgCyan , icon: "ℹ" },
    success: { color: chalk.green, bgColor: chalk.bgGreen, icon: "✓" },
    warning: { color: chalk.yellow, bgColor: chalk.bgYellow, icon: "⚠" },
    danger:  { color: chalk.red, bgColor: chalk.bgRed, icon: "✗" },
    muted:   { color: chalk.gray, bgColor: chalk.bgGray, icon: "•" },
  };

  private static formatMessage(
    message: string,
    variant: Variant,
    options: LogOptions
  ): string {
    const { indent = 0, bold = false, time = false, bg = false } = options;
    const { color, bgColor, icon } = this.variants[variant] || this.variants.info;

    const timestamp = time
      ? chalk.gray(`[${new Date().toISOString()}] `)
      : "";

    const padding = variant.includes("plain_") ? 0 : 3;

    const trueIndent = padding + indent;

    const styledMsg = bold ? chalk.bold(message) : message;
    const prefix = " ".repeat(trueIndent) + icon + " ";

    if (bg) {
      return `${prefix}${timestamp}${bgColor(styledMsg)}`;
    }

    return `${prefix}${timestamp}${color(styledMsg)}`;
  }

  static test() {
    Logger.info("Starting tests...");
    Logger.success("Test passed!", { indent: 2, bold: true });
    Logger.warning("This is a warning", { time: true });
    Logger.danger("Test failed!", { indent: 4 });
    Logger.muted("Some debug info", { indent: 6, time: true });
  }

  static log(message: string, variant: Variant = "info", options: LogOptions = {}) {
    console.log(this.formatMessage(message, variant, options));
  }

  static plain_bright(message: string, options: LogOptions = {}) {
    this.log(message, "plain_bright", options);
  }

  static plain_dark(message: string, options: LogOptions = {}) {
    this.log(message, "plain_dark", options);
  }

  static info(message: string, options: LogOptions = {}) {
    this.log(message, "info", options);
  }

  static success(message: string, options: LogOptions = {}) {
    this.log(message, "success", options);
  }

  static warning(message: string, options: LogOptions = {}) {
    this.log(message, "warning", options);
  }

  static danger(message: string, options: LogOptions = {}) {
    this.log(message, "danger", options);
  }

  static muted(message: string, options: LogOptions = {}) {
    this.log(message, "muted", options);
  }
}
