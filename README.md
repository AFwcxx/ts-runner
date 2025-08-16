# ts-runner
An executable unit test program for typescript node project that make sense to me.

## Usage

```bash
$ npm install --save-dev github:AFwcxx/ts-runner
```

Declare in a file:

```javascript
import { Runner } from "ts-runner";

const program = [
  // Edit here start ==
  {
    subject: "Demo test run..",
    executor: function () {
      console.log("Internal message log.");
      throw new Error("When an error occur.");
    },
  },
  // Edit here end ==
];

Runner.go(program);
```

And then you can refer to [this test](src/test.ts).
