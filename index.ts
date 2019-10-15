#!/usr/bin/env node

import yargs from 'yargs';
import Compiler from './src/compiler'
import { read, print } from './src/io'

const argv = yargs.options({
  'clang++': {
    type: 'boolean',
  },
  'g++': {
    type: 'boolean',
  }
}).argv

const cp = new Compiler(argv["clang++"] ? 'clang++' : 'g++')

async function repl(): Promise<void> {
  const code: string = await read()
  const res = await cp.processInput(code)
  print(res.output, false)
  const output = await cp.execute()
  print(output, false)
}

async function runRepl() {
  while (1) {
    try {
      await repl()
    } catch (e) {
      console.log(e)
      process.exit(0)
    }
  }
}

runRepl()
