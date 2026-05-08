import clc from "cli-color";
import * as readline from "node:readline";

export const questionColor = clc.xterm(45);
export const errorColor = clc.xterm(198);
export const botColor = clc.xterm(190);

let rlInterface: readline.Interface | null = null;

function getInterface(): readline.Interface {
  if (!rlInterface) {
    rlInterface = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  return rlInterface;
}

export const createQuestion = (question: string): Promise<string> => {
  return new Promise((resolve) => {
    getInterface().question(questionColor(question), (answer: string) => {
      resolve(answer);
    });
  });
};

export const closeInterface = () => {
  if (rlInterface) {
    rlInterface.close();
    rlInterface = null;
  }
};
