import * as inquirer from 'inquirer';

export async function askYesNo(
  question: string,
  defaultAnswer: boolean
): Promise<boolean> {
  const answers: inquirer.Answers = await inquirer.prompt({
    type: 'confirm',
    name: 'doit',
    message: question,
    default: defaultAnswer,
  });
  return answers.doit;
}

export async function askQuestion(
  question: string,
  defaultAnswer = ''
): Promise<string> {
  const answers: inquirer.Answers = await inquirer.prompt({
    type: 'input',
    name: 'value',
    message: question,
    default: defaultAnswer,
  });
  return answers.value;
}
