"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
class Logger {
    static formatMessage(message, variant, options) {
        const { indent = 0, bold = false, time = false, bg = false } = options;
        const { color, bgColor, icon } = this.variants[variant] || this.variants.info;
        const timestamp = time
            ? chalk_1.default.gray(`[${new Date().toISOString()}] `)
            : "";
        const padding = variant.includes("plain_") ? 0 : 3;
        const trueIndent = padding + indent;
        const styledMsg = bold ? chalk_1.default.bold(message) : message;
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
    static log(message, variant = "info", options = {}) {
        console.log(this.formatMessage(message, variant, options));
    }
    static plain_bright(message, options = {}) {
        this.log(message, "plain_bright", options);
    }
    static plain_dark(message, options = {}) {
        this.log(message, "plain_dark", options);
    }
    static info(message, options = {}) {
        this.log(message, "info", options);
    }
    static success(message, options = {}) {
        this.log(message, "success", options);
    }
    static warning(message, options = {}) {
        this.log(message, "warning", options);
    }
    static danger(message, options = {}) {
        this.log(message, "danger", options);
    }
    static muted(message, options = {}) {
        this.log(message, "muted", options);
    }
}
Logger.variants = {
    plain_bright: { color: chalk_1.default.whiteBright, bgColor: chalk_1.default.bgWhiteBright, icon: "" },
    plain_dark: { color: chalk_1.default.grey, bgColor: chalk_1.default.bgGrey, icon: "" },
    info: { color: chalk_1.default.cyan, bgColor: chalk_1.default.bgCyan, icon: "ℹ" },
    success: { color: chalk_1.default.green, bgColor: chalk_1.default.bgGreen, icon: "✓" },
    warning: { color: chalk_1.default.yellow, bgColor: chalk_1.default.bgYellow, icon: "⚠" },
    danger: { color: chalk_1.default.red, bgColor: chalk_1.default.bgRed, icon: "✗" },
    muted: { color: chalk_1.default.gray, bgColor: chalk_1.default.bgGray, icon: "•" },
};
exports.default = Logger;
//# sourceMappingURL=logger.js.map