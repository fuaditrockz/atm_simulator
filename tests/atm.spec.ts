import { __testing } from "../src/atm/index.js";
import { botColor } from "../src/helpers/index.js";

const logSpy = jest.spyOn(console, "log").mockImplementation(() => undefined);

const runCommands = (commands: string[]) => {
  for (const command of commands) {
    expect(__testing.processCommand(command)).toBe(true);
  }
};

const getLogs = () =>
  logSpy.mock.calls.map((call: unknown[]) => String(call[0]));

const setupUntilBobHasDebt70 = () => {
  runCommands([
    "login Alice",
    "deposit 100",
    "logout",
    "login Bob",
    "deposit 80",
    "transfer Alice 50",
    "transfer Alice 100",
  ]);
};

beforeEach(() => {
  __testing.resetState();
  logSpy.mockClear();
});

afterAll(() => {
  logSpy.mockRestore();
});

describe("login command", () => {
  it("creates user when not exists and shows initial balance", () => {
    runCommands(["login Alice"]);

    expect(getLogs()).toEqual([
      botColor("Hello, Alice!"),
      botColor("Your balance is $0"),
    ]);
  });
});

describe("deposit command", () => {
  it("auto-pays debt first, then prints latest status", () => {
    setupUntilBobHasDebt70();
    logSpy.mockClear();

    runCommands(["deposit 30"]);

    expect(getLogs()).toEqual([
      botColor("Transferred $30 to Alice"),
      botColor("Your balance is $0"),
      botColor("Owed $40 to Alice"),
    ]);
  });
});

describe("transfer command", () => {
  it("offsets existing debt before moving balance", () => {
    runCommands([
      "login Alice",
      "deposit 100",
      "logout",
      "login Bob",
      "deposit 80",
      "transfer Alice 50",
      "transfer Alice 100",
      "deposit 30",
      "logout",
      "login Alice",
      "transfer Bob 30",
    ]);

    const logs = getLogs();
    expect(logs.slice(-2)).toEqual([
      botColor("Your balance is $210"),
      botColor("Owed $10 from Bob"),
    ]);
  });
});

describe("logout command", () => {
  it("logs out active user with goodbye message", () => {
    runCommands(["login Bob"]);
    logSpy.mockClear();

    runCommands(["logout"]);

    expect(getLogs()).toEqual([botColor("Goodbye, Bob!")]);
  });
});

describe("withdraw command", () => {
  it("reduces balance when funds are sufficient", () => {
    runCommands(["login Alice", "deposit 100"]);
    logSpy.mockClear();

    runCommands(["withdraw 40"]);

    expect(getLogs()).toEqual([botColor("Your balance is $60")]);
  });
});

describe("exit command", () => {
  it("stops when exit command is received", () => {
    const shouldContinue = __testing.processCommand("exit");
    expect(shouldContinue).toBe(false);
  });
});
