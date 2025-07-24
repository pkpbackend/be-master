import fs from 'fs'
import path from 'path'
import { logServer } from './Formatter'

/**
 *
 * @param {string} pathDir
 */
export function createDirNotExist(pathDir) {
  if (!fs.existsSync(path.resolve(pathDir))) {
    fs.mkdirSync(pathDir, { recursive: true })
    console.log(logServer('path', `created directory => ${pathDir}`))
  }
}
