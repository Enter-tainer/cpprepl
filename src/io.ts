import prompts = require('prompts')
import { stdout } from 'process'

function print(str: string, newline: boolean = true) {
  stdout.write(str + (newline ? '\n' : ''))
}

async function read(): Promise<string> {
  let res = await (async () => {
    const rep = await prompts({
      type: 'text',
      message: '>>=',
      name: 'value'
    })
    return rep.value
  })()
  return res
}

export { print, read }