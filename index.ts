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


const cp = new Compiler('g++')

async function solve(): Promise<void> {
  const code: string = await read()
  const res = await cp.processInput(code)
  print(res.output, false)
  const output = await cp.execute()
  print(output, false)
}

async function qwq() {
  while (1) {
    await solve()
  }
}

qwq()