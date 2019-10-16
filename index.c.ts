#!/usr/bin/env node

import yargs from 'yargs'
import runRepl from '.'
import Compiler from './src/compiler'

const argv = yargs.options({
  'clang': {
    type: 'boolean',
  },
  'gcc': {
    type: 'boolean',
  },
}).argv

let compilerName = 'gcc'

if (argv["clang++"] || argv["g++"])
  compilerName = argv["gcc"] ? 'gcc' : 'clang'

runRepl(new Compiler(compilerName))
