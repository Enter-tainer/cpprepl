const inquirer = require('inquirer');

import { stdout } from 'process'

function print(str: string, newline: boolean = true) {
  stdout.write(str + (newline ? '\n' : ''))
}

async function read(): Promise<string> {
  const res: { value: string } = await inquirer.prompt({
    message: '>>=',
    type: 'input',
    name: 'value'
  })
  return res.value
}

export { print, read }
