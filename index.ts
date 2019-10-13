#!/usr/bin/env node

import yargs from 'yargs';
import Compiler from './src/compiler'
import { rl, print } from './src/io'

const argv = yargs.options({
  'clang++': {
    type: 'boolean',
  },
  'g++': {
    type: 'boolean',
  }
}).argv


const cp = new Compiler('g++')

rl.on('line', async (code) => {
  const res = await cp.compile(code)
  print(res.output, false)
  const output = await cp.execute()
  print(output, false)
})