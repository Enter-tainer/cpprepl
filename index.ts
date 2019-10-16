import Compiler from './src/compiler'
import { read, print } from './src/io'

async function repl(cp: Compiler): Promise<void> {
  const code: string = await read()
  const res = await cp.processInput(code)
  print(res.output, false)
  const output = await cp.execute()
  print(output, false)
}

async function runRepl(cp: Compiler) {
  while (1) {
    try {
      await repl(cp)
    } catch (e) {
      console.error(e)
      process.exit(0)
    }
  }
}

export default runRepl
