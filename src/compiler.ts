import { exec } from 'child_process'
import { promisify } from 'util'
import { tmpdir } from 'os'
import { writeFile, copyFile, access, copyFileSync } from 'fs'
import { join } from 'path'
import { trim } from 'lodash'

const execA = promisify(exec)
const writeFileA = promisify(writeFile)
const copyFileA = promisify(copyFile)
const accessA = promisify(access)

interface compileResult {
  success: boolean,
  output: string
}

class Compiler {
  compiler: string
  code: Array<string>
  constructor(compiler: string) {
    this.compiler = compiler
    this.code = []
    const headerpath = join(tmpdir(), 'dbg.h')
    copyFileSync(join('template', 'dbg.h'), headerpath)
  }
  private static wrapCodeWithdbg(code: string): string {
    code = trim(code, ';')
    return `type_of(${code});`
  }
  private static addSemicolon(code: string): string {
    code = trim(code, ';')
    return `${code};`
  }
  private static concatCode(code: Array<string>): string {
    let res: string = ''
    for (const i of code) {
      res = res.concat(i);
    }
    return `#include "dbg.h"\n${res}\n}`
  }
  private static async isExist(path: string): Promise<boolean> {
    try {
      await accessA(join(tmpdir(), 'dbg.h'))
      return true
    } catch (e) {
      return false
    }
  }
  private async basicCompile(code: Array<string>): Promise<compileResult> {
    let resCode = Compiler.concatCode(code)
    const filepath = join(tmpdir(), 'repl.cxx')
    const headerpath = join(tmpdir(), 'dbg.h')
    const execPath = join(tmpdir(), 'a.out')
    await writeFileA(filepath, resCode)
    let exec_res: {
      stdout: string;
      stderr: string;
    }
    if (!(await Compiler.isExist(headerpath))) {
      await copyFileA(join('template', 'dbg.h'), headerpath)
    }
    try {
      exec_res = await execA(`${this.compiler} ${filepath} -o ${execPath}`, { shell: '/bin/bash', windowsHide: true })
      return {
        success: true,
        output: exec_res.stdout
      }
    } catch (e) {
      return {
        success: false,
        output: e.stderr
      }
    }
  }

  async compile(code: string): Promise<compileResult> {
    code = Compiler.addSemicolon(code)
    let tmp = [...this.code]
    tmp.push(Compiler.wrapCodeWithdbg(code))
    const r = await this.basicCompile(tmp)
    if (!r.success) {
      tmp.pop()
      tmp.push(code)
      const t = await this.basicCompile(tmp)
      if (!t.success) {
        return t
      } else {
        this.code.push(code)
        return t
      }
    } else {
      this.code.push(Compiler.wrapCodeWithdbg(code))
      return r
    }
  }

  async execute(): Promise<string> {
    const execPath = join(tmpdir(), 'a.out')
    const res = await execA(execPath,{ shell: '/bin/bash', windowsHide: true })
    return res.stdout
  }
}

export default Compiler