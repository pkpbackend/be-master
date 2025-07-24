import chalk from 'chalk'
import {
  APP_PORT,
  NODE_ENV,
  URL_CLIENT_PRODUCTION,
  URL_CLIENT_STAGING,
  URL_SERVER_PRODUCTION,
  URL_SERVER_STAGING,
} from './env'

const URL_CLIENT = {
  development: 'http://localhost:3000',
  staging: URL_CLIENT_STAGING,
  production: URL_CLIENT_PRODUCTION,
}

const URL_SERVER = {
  development: `http://localhost:${APP_PORT ?? 8000}`,
  staging: URL_SERVER_STAGING,
  production: URL_SERVER_PRODUCTION,
}

export const LOG_SERVER = chalk.green('[server]')

const BASE_URL_CLIENT = URL_CLIENT[NODE_ENV]
const BASE_URL_SERVER = URL_SERVER[NODE_ENV]

export { BASE_URL_CLIENT, BASE_URL_SERVER }
