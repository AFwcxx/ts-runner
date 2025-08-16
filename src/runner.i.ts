"use strict";

export interface GoOptions {
  name?: string;
  slackWebhookUrl?: string;
}

export interface Process {
  subject: string;
  executor: Function;
  activate?: boolean;
  exitOnError?: boolean;
  notifyOnStart?: boolean;
  notifyOnEnd?: boolean;
};

export interface Baton {
  data: Record<string,any>;
};

export interface SlackOptions {
  webhookUrl: string;
  subject: string;
}

export interface SlackProgressOptions extends SlackOptions {
  type: "start" | "end";
}

export interface SlackStatOptions extends SlackOptions {
  durationMs: string;
  executionCount: number;
  successCount: number;
  errorCount: number;
}
