import { join } from "path"

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

export default getLocalPath