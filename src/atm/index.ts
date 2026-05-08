import rlInterface, {
  botColor,
  createQuestion,
  errorColor,
} from "../helpers/index.js";

// Data utama ATM: saldo customer dan relasi hutang (debts[peminjam][pemberi])
const customers: Record<string, { balance: number }> = {};
const debts: Record<string, Record<string, number>> = {};
let currentUser: string | null = null;

// Memastikan data user tersedia; jika belum ada maka dibuat baru.
function ensureCustomer(name: string) {
  if (!customers[name]) {
    customers[name] = { balance: 0 };
    debts[name] = {};
  }
}

// Menampilkan saldo user aktif beserta info hutang dan piutang.
function printStatus(name: string) {
  console.log(botColor(`Your balance is $${customers[name].balance}`));

  for (const creditor of Object.keys(debts[name] ?? {})) {
    const amount = debts[name][creditor];
    if (amount > 0) {
      console.log(botColor(`Owed $${amount} to ${creditor}`));
    }
  }

  for (const debtor of Object.keys(debts)) {
    const amount = debts[debtor][name] ?? 0;
    if (amount > 0) {
      console.log(botColor(`Owed $${amount} from ${debtor}`));
    }
  }
}

// Mengubah input nominal (mis. "$100") menjadi angka.
function parseAmount(raw: string | undefined): number {
  if (!raw) return NaN;
  return Number(raw.replace(/\$/g, ""));
}

// Login user; jika user belum ada maka otomatis dibuat.
function login(name: string) {
  if (currentUser) {
    console.log(errorColor("(!) You need to log out first"));
    return;
  }

  ensureCustomer(name);
  currentUser = name;
  console.log(botColor(`Hello, ${name}!`));
  printStatus(name);
}

// Logout user yang sedang aktif.
function logout() {
  if (!currentUser) {
    console.log(errorColor("(!) You have not logged in yet"));
    return;
  }

  console.log(botColor(`Goodbye, ${currentUser}!`));
  currentUser = null;
}

// Menambah saldo, lalu otomatis membayar hutang yang masih ada.
function deposit(rawAmount: string) {
  if (!currentUser) {
    console.log(errorColor("(!) You have not logged in yet"));
    return;
  }

  const amount = parseAmount(rawAmount);
  if (!Number.isFinite(amount) || amount <= 0) {
    console.log(errorColor("(!) Invalid amount"));
    return;
  }

  customers[currentUser].balance += amount;

  // Jika punya hutang, deposit dipakai melunasi dulu secara otomatis.
  for (const creditor of Object.keys(debts[currentUser])) {
    const owed = debts[currentUser][creditor];
    if (owed <= 0) continue;

    const paid = Math.min(owed, customers[currentUser].balance);
    customers[currentUser].balance -= paid;
    customers[creditor].balance += paid;
    debts[currentUser][creditor] -= paid;

    if (debts[currentUser][creditor] === 0) {
      delete debts[currentUser][creditor];
    }

    console.log(botColor(`Transferred $${paid} to ${creditor}`));
  }

  printStatus(currentUser);
}

// Menarik saldo user jika dana mencukupi.
function withdraw(rawAmount: string) {
  if (!currentUser) {
    console.log(errorColor("(!) You have not logged in yet"));
    return;
  }

  const amount = parseAmount(rawAmount);
  if (!Number.isFinite(amount) || amount <= 0) {
    console.log(errorColor("(!) Invalid amount"));
    return;
  }

  if (customers[currentUser].balance < amount) {
    console.log(errorColor("(!) Insufficient balance"));
    return;
  }

  customers[currentUser].balance -= amount;
  printStatus(currentUser);
}

// Transfer dana ke target; jika saldo kurang maka sisanya dicatat sebagai hutang.
function transfer(target: string, rawAmount: string) {
  if (!currentUser) {
    console.log(errorColor("(!) You have not logged in yet"));
    return;
  }

  if (!target) {
    console.log(errorColor("(!) Usage: transfer [target] [amount]"));
    return;
  }

  if (target === currentUser) {
    console.log(errorColor("(!) You cannot send to yourself!"));
    return;
  }

  const amount = parseAmount(rawAmount);
  if (!Number.isFinite(amount) || amount <= 0) {
    console.log(errorColor("(!) Invalid amount"));
    return;
  }

  ensureCustomer(target);

  let remaining = amount;

  // Offset dulu jika target punya hutang ke current user.
  const targetOwesMe = debts[target]?.[currentUser] ?? 0;
  if (targetOwesMe > 0) {
    const offset = Math.min(targetOwesMe, remaining);
    debts[target][currentUser] -= offset;
    remaining -= offset;

    if (debts[target][currentUser] === 0) {
      delete debts[target][currentUser];
    }
  }

  const sent = Math.min(customers[currentUser].balance, remaining);
  if (sent > 0) {
    customers[currentUser].balance -= sent;
    customers[target].balance += sent;
    console.log(botColor(`Transferred $${sent} to ${target}`));
  }

  const newDebt = remaining - sent;
  if (newDebt > 0) {
    debts[currentUser][target] = (debts[currentUser][target] ?? 0) + newDebt;
  }

  printStatus(currentUser);
}

// Memetakan input command ke fungsi ATM yang sesuai.
function processCommand(input: string): boolean {
  const [command, ...args] = input.trim().split(/\s+/);

  if (!command) {
    return true;
  }

  switch (command.toLowerCase()) {
    case "login":
      login(args[0] ?? "");
      return true;
    case "logout":
      logout();
      return true;
    case "deposit":
      deposit(args[0] ?? "");
      return true;
    case "withdraw":
      withdraw(args[0] ?? "");
      return true;
    case "transfer":
      transfer(args[0] ?? "", args[1] ?? "");
      return true;
    case "exit":
      return false;
    default:
      console.log(errorColor("(!) Command not found!"));
      return true;
  }
}

// Menjalankan loop CLI ATM sampai user mengetik perintah "exit".
const ATMProject = async () => {
  while (true) {
    const answer = String(await createQuestion("$ ")).trim();
    const shouldContinue = processCommand(answer);
    if (!shouldContinue) {
      rlInterface.close();
      break;
    }
  }
};

export default ATMProject;
