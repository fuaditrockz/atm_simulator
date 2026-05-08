# ATM Simulator (TypeScript CLI)

A simple Command Line Interface (CLI) app that simulates ATM interactions:

- login / logout
- deposit / withdraw
- transfer between users
- automatic debt tracking and debt repayment

## Why You Should Use pnpm

This repository is configured with:

- `packageManager: pnpm@10.33.3`
- `pnpm-lock.yaml`

Using `pnpm` is strongly recommended because:

- It guarantees dependency versions that match this project lockfile.
- It is faster and more disk-efficient via content-addressable storage.
- It avoids lockfile drift that can happen when mixing npm/yarn with pnpm.

If you use another package manager, the app might still run, but dependency resolution may differ from the intended setup.

## Requirements

- Node.js 18+ (recommended latest LTS)
- pnpm 10+

## Install

```bash
pnpm install
```

## Run the App

Development mode:

```bash
pnpm run dev
```

Build and run production mode:

```bash
pnpm run build
pnpm start
```

Type-check only:

```bash
pnpm run typecheck
```

## Available Commands

- `login [name]`:
  Logs in as a customer. If the customer does not exist, it will be created.
- `deposit [amount]`:
  Adds money to your balance. If you owe someone, deposit will auto-pay your debt first.
- `withdraw [amount]`:
  Withdraws money from your balance (only if balance is sufficient).
- `transfer [target] [amount]`:
  Transfers money to target user. If your balance is not enough, the remaining amount becomes debt.
- `logout`:
  Logs out current user.
- `exit`:
  Exits the CLI application.

## How Debt Works in This App

- If user A transfers more than current balance to user B, user A will owe the remainder to user B.
- If user A later deposits money, debt repayment is done automatically first.
- If user B transfers back to user A while user A owes B, the transfer first offsets that debt.

## Complete Example Session (Input + Output)

Notes:

- Prompt is shown as `$ `.
- Output is colorized in terminal, but shown below as plain text.

```bash
$ login Alice
Hello, Alice!
Your balance is $0

$ deposit 100
Your balance is $100

$ logout
Goodbye, Alice!

$ login Bob
Hello, Bob!
Your balance is $0

$ deposit 80
Your balance is $80

$ transfer Alice 50
Transferred $50 to Alice
Your balance is $30

$ transfer Alice 100
Transferred $30 to Alice
Your balance is $0
Owed $70 to Alice

$ deposit 30
Transferred $30 to Alice
Your balance is $0
Owed $40 to Alice

$ logout
Goodbye, Bob!

$ login Alice
Hello, Alice!
Your balance is $210
Owed $40 from Bob

$ transfer Bob 30
Transferred $20 to Bob
Your balance is $190

$ logout
Goodbye, Alice!

$ login Bob
Hello, Bob!
Your balance is $20
Owed $10 to Alice

$ deposit 100
Transferred $10 to Alice
Your balance is $110

$ withdraw 50
Your balance is $60

$ logout
Goodbye, Bob!

$ exit
```

## Dependencies Used

From `dependencies` in `package.json`:

- `cli-color`:
  Used for terminal text coloring (prompt/output/error visual clarity).
- `cli-table`:
  Utility for table formatting in terminal output. Currently not actively used in ATM flow.
- `fakerator`:
  Utility for generating fake/mock data. Currently not actively used in ATM flow.
- `lodash`:
  General utility helpers for data transformation/manipulation. Currently not actively used in ATM flow.
- `ramda`:
  Functional utility library. Currently not actively used in ATM flow.

From `devDependencies`:

- `typescript`:
  TypeScript compiler and type system.
- `tsx`:
  Runs TypeScript files directly in Node.js for development.
- `@types/node`:
  Type definitions for Node.js APIs.

## Project Scripts

- `pnpm run dev`: run CLI directly from TypeScript source.
- `pnpm run dev:watch`: run CLI with file watching.
- `pnpm run build`: compile TypeScript to `dist/`.
- `pnpm run typecheck`: run TypeScript checks without output files.
- `pnpm start`: run compiled JavaScript from `dist/`.

## Notes

- App state is in-memory only (no database/file persistence).
- Restarting the process resets all users and balances.
