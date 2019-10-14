import * as readline from 'readline'

let rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true,
  prompt: '>>='
})

function print(str: string, newline: boolean = true) {
  rl.write(str + (newline ? '\n' : ''))
}

export { print, rl }