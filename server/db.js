// Mini base de datos en JSON (sin dependencias nativas). Para producción,
// sustituir por PostgreSQL/MongoDB manteniendo la misma interfaz.
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const FILE = process.env.DB_FILE || path.join(__dirname, 'data', 'db.json')

let data = { users: [], orders: [], secret: crypto.randomBytes(32).toString('hex') }

export function load() {
  try {
    data = { ...data, ...JSON.parse(fs.readFileSync(FILE, 'utf8')) }
  } catch {
    save()
  }
  return data
}

let timer = null
export function save() {
  clearTimeout(timer)
  timer = setTimeout(() => {
    const tmp = FILE + '.tmp'
    fs.mkdirSync(path.dirname(FILE), { recursive: true })
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2))
    fs.renameSync(tmp, FILE)
  }, 50)
}

export const db = () => data
export const uid = (prefix) => prefix + crypto.randomBytes(5).toString('hex')
