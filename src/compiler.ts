import { exec } from 'child_process'
import { promisify } from 'util'
import { tmpdir } from 'os'
import { writeFile, copyFile, access, copyFileSync } from 'fs'
import { join } from 'path'
import { trim } from 'lodash'
import { getLocalPath, getOSExecName } from './file'

const execA = promisify(exec)
const writeFileA = promisify(writeFile)
const copyFileA = promisify(copyFile)
const accessA = promisify(access)

interface execResult {
  success: boolean,
  output: string
}

class Compiler {
  compiler: string
  code: Array<string>
  includes: Array<string>
  langExt: string
  constructor(compiler: string) {
    this.compiler = compiler
    this.code = []
    this.includes = ['dbg.h']
    if (this.compiler === 'gcc' || this.compiler === 'clang')
      this.langExt = 'c'
    else
      this.langExt = 'cxx'
  }
  static wrapCodeWith(code: string, wrapper: string = 'value_of'): string {
    code = trim(code, ';')
    return `${wrapper}(${code});`
  }

  static wrapInclude(module: string): string {
    return `#include "${module}"`
  }

  static addSemicolon(code: string): string {
    code = trim(code, ';')
    return `${code};`
  }
  static concatCode(code: Array<string>, includes: Array<string>): string {
    let resCode: string = ''
    let resInclude: string = ''
    for (const i of includes) {
      resInclude = resInclude.concat(Compiler.wrapInclude(i)) + '\n'
    }
    for (const i of code) {
      resCode = resCode.concat(i) + '\n';
    }
    return `${resInclude}\nint main () {\n${resCode}\n}`
  }
  static async isExist(path: string): Promise<boolean> {
    try {
      await accessA(join(tmpdir(), 'dbg.h'))
      return true
    } catch (e) {
      return false
    }
  }
  private async basicCompile(code: Array<string>, includes: Array<string>): Promise<execResult> {
    let resCode = Compiler.concatCode(code, includes)
    const filepath = join(tmpdir(), `repl.${this.langExt}`)
    const headerpath = join(tmpdir(), 'dbg.h')
    const execPath = join(tmpdir(), getOSExecName())
    await writeFileA(filepath, resCode)
    let exec_res: {
      stdout: string;
      stderr: string;
    }
    await copyFileA(await getLocalPath(join('template', 'dbg.h')), headerpath)
    let cxx17 = '';
    if (this.langExt == 'cxx') {
      cxx17 = '-std=c++17'
    }
    try {
      const execCommand = `${this.compiler} -w ${filepath} ${cxx17} -fdiagnostics-color -o ${execPath}`
      exec_res = await execA(execCommand, { windowsHide: true })
      return {
        success: true,
        output: exec_res.stderr
      }
    } catch (e) {
      return {
        success: false,
        output: e.stderr
      }
    }
  }

  private static isCommand(code: string): boolean {
    code = trim(code)
    if (code === '')
      return false
    return code[0] === ':'
  }

  async processInput(line: string): Promise<execResult> {
    return Compiler.isCommand(line) ? this.command(line) : this.compile(line)
  }

  async command(cmd: string): Promise<execResult> {
    try {
      const oprandArr: Array<string> = cmd.split(' ')
      let oprand: string = ''
      for (let i = 1; i < oprandArr.length; ++i) {
        oprand += oprandArr[i] + (i == oprandArr.length - 1 ? '' : ' ')
      }
      let tmp = [...this.code]
      let r: execResult
      switch (oprandArr[0]) {
        case ':b':
        case ':bin':
          tmp.push(Compiler.wrapCodeWith(oprand, 'print_bytes'))
          r = await this.basicCompile(tmp, this.includes)
          return r
        case ':x':
        case ':hex':
          tmp.push(Compiler.wrapCodeWith(oprand, 'print_hex'))
          r = await this.basicCompile(tmp, this.includes)
          return r
        case ':h':
        case ':help':
          return {
            success: true,
            output: ''
          }

        case ':m':
        case ':module':
          let tmpInclude = [...this.includes]
          tmpInclude.push(oprand)
          let compileRes = await this.basicCompile(this.code, tmpInclude)
          if (compileRes.success) {
            this.includes.push(oprand)
          }
          return {
            success: compileRes.success,
            output: compileRes.success ? `Load ${oprand} success\n` : `Fail to load ${oprand}\n`
          }
        case ':t':
        case ':type':
          tmp.push(Compiler.wrapCodeWith(oprand, 'type_of'))
          r = await this.basicCompile(tmp, this.includes)
          return r
        case ':q':
        case ':quit':
          process.exit(0)
      }
    } catch (e) {
      return {
        success: false,
        output: e.message
      }
    }
    return {
      success: false,
      output: 'match command failed\n'
    }
  }

  async compile(code: string): Promise<execResult> {
    code = Compiler.addSemicolon(code)
    let tmp = [...this.code]
    tmp.push(Compiler.wrapCodeWith(code))
    let r = await this.basicCompile(tmp, this.includes)
    if (!r.success) {
      tmp.pop()
      tmp.push(code)
      r = await this.basicCompile(tmp, this.includes)
      if (r.success) {
        this.code.push(code)
      }
    } else {
      this.code.push(code)
    }
    return r
  }

  async execute(): Promise<string> {
    const execPath = join(tmpdir(), getOSExecName())
    const res = await execA(execPath, { windowsHide: true })
    return res.stdout
  }
}

export default Compiler
