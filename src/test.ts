"use strict";

import 'dotenv/config';

import { Runner, Baton, Process } from "./runner";

const program: Array<Process> = [
  // Edit here start ==
  {
    activate: true,
    subject: "This show show up first..",
    executor: function (baton: Baton) {
      console.log("I am just logging..");
      baton.data.fromFirst = { myData: 5 };
    },
  },
  {
    subject: "I am second!",
    exitOnError: false,
    executor: async function () {
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log("What the crap <~>");
      throw new Error("Something wrong with something something..");
    },
  },
  {
    subject: "Not sure after which one but definitely the second last.",
    notifyOnStart: true,
    notifyOnEnd: true,
    executor: async function (baton: Baton) {
      console.log("Let me go first..");
      await new Promise(resolve => setTimeout(resolve, 1000));
      baton.data.someone = "Hello stranger!";
      console.error("Followed by me..");
    },
  },
  {
    subject: "I am the last one!",
    notifyOnEnd: true,
    executor: function (baton: Baton) {
      console.log(baton.data.someone);
      console.log(baton.data.fromFirst);
      throw new Error("Something is not working because of something..");
    },
  }
  // Edit here end ==
];

Runner.go(program, {
  name: "Logger test.",
  slackWebhookUrl: process.env.SLACK_WEBHOOK_URL || undefined
});

