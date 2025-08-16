"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const runner_1 = require("./runner");
const program = [
    {
        activate: true,
        subject: "This show show up first..",
        executor: function (baton) {
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
        executor: async function (baton) {
            console.log("Let me go first..");
            await new Promise(resolve => setTimeout(resolve, 1000));
            baton.data.someone = "Hello stranger!";
            console.error("Followed by me..");
        },
    },
    {
        subject: "I am the last one!",
        notifyOnEnd: true,
        executor: function (baton) {
            console.log(baton.data.someone);
            console.log(baton.data.fromFirst.myData);
            throw new Error("Something is not working because of something..");
        },
    }
];
runner_1.Runner.go(program, {
    name: "Logger test.",
    slackWebhookUrl: process.env.SLACK_WEBHOOK_URL || undefined
});
//# sourceMappingURL=test.js.map