type Variant = "plain_bright" | "plain_dark" | "info" | "success" | "warning" | "danger" | "muted";
interface LogOptions {
    indent?: number;
    bold?: boolean;
    time?: boolean;
    bg?: boolean;
}
export default class Logger {
    private static variants;
    private static formatMessage;
    static test(): void;
    static log(message: string, variant?: Variant, options?: LogOptions): void;
    static plain_bright(message: string, options?: LogOptions): void;
    static plain_dark(message: string, options?: LogOptions): void;
    static info(message: string, options?: LogOptions): void;
    static success(message: string, options?: LogOptions): void;
    static warning(message: string, options?: LogOptions): void;
    static danger(message: string, options?: LogOptions): void;
    static muted(message: string, options?: LogOptions): void;
}
export {};
