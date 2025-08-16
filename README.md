# ts-runner

An **executable unit test runner** for TypeScript + Node.js projects.  
Designed to be simple, lightweight, and easy to use, the way unit tests make sense to me.

---

## Installation

Install directly from GitHub:

```bash
npm install --save-dev github:AFwcxx/ts-runner

# Update to newer version
npm upgrade --save-dev github:AFwcxx/ts-runner
```

---

## Quick Start

Create a file (e.g., `test.ts`) and declare your tests:

```ts
import { Runner } from "ts-runner";

const program = [
  {
    subject: "Demo test run..",
    executor: () => {
      console.log("Internal message log.");
      throw new Error("When an error occurs.");
    },
  },
];

Runner.go(program);
```

Run it with:

```bash
npx ts-node test.ts
```

---

## Example

Check out the [example test](src/test.ts) to see it in action.

