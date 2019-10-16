#!/usr/bin/env node

import yargs from 'yargs'
import runRepl from '.'
import Compiler from './src/compiler'

const argv = yargs.options({
  'clang++': {
    type: 'boolean',
  },
  'g++': {
    type: 'boolean',
  },
}).argv

let compilerName = 'g++'

if (argv["clang++"] || argv["g++"])
  compilerName = argv["g++"] ? 'g++' : 'clang++'

runRepl(new Compiler(compilerName))
