import { GoOptions, Process } from "./runner.i";
export * from "./runner.i";
export declare class Runner {
    static go(program: Array<Process>, options?: GoOptions): Promise<Record<string, any>>;
}
