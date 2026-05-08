import clc from "cli-color";
import * as readline from "node:readline";

export const questionColor = clc.xterm(45);
export const errorColor = clc.xterm(198);
export const botColor = clc.xterm(190);

const rlInterface = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

export const createQuestion = (question: string): Promise<string> => {
  return new Promise((resolve) => {
    rlInterface.question(questionColor(question), (answer: string) => {
      resolve(answer);
    });
  });
};

export default rlInterface;
