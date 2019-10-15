import { join } from "path"
import { platform } from 'os'

const { getInstalledPath } = require('get-installed-path')
const detectInstalled = require('detect-installed')

async function getLocalPath(filename: string): Promise<string> {
  if (await detectInstalled('cpprepl')) {
    let res = await getInstalledPath('cpprepl')
    res = join(res, filename)
    return res
  } else {
    return filename
  }
}

function getOSExecName(): string {
  if (platform() === 'win32') {
    return 'a.exe'
  } else if (platform() === 'linux'){
    return 'a.out'
  }
  return 'a.out'
}

export { getLocalPath, getOSExecName }
