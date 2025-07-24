
import chalk from 'chalk'
import http from 'http'
import { logErrServer, logServer } from './helpers/Formatter'
import {
  DB_CONNECTION,
  DB_DATABASE,
  NODE_ENV,
  APP_NAME,
  APP_PORT,
} from './config/env'
import db from './database/models/_instance'
import Express from 'express'
import path from 'path'
import Helmet from 'helmet'
import Cors from 'cors'
import Logger from 'morgan'
import CookieParser from 'cookie-parser'
import Compression from 'compression'
import Hpp from 'hpp'
import RequestIp from 'request-ip'
import UserAgent from 'express-useragent'

import winstonLogger, { winstonStream } from './config/Logger'
import withState from './helpers/withState'
import indexRoutes from './routes/index'
import v3Routes from './routes/v3'
import Response from './modules/Response'
import allowedOrigins from './constants/ConstAllowedOrigins'

const App = Express()

const optCors = {
  allowedOrigins: allowedOrigins,
}

// view engine setup
App.set('views', path.join(`${__dirname}/../`, 'views'))
App.set('view engine', 'pug')

App.use(Helmet())
App.use(Cors(optCors))
App.use(Logger('combined', { stream: winstonStream }))
App.use(Express.urlencoded({ extended: true }))
App.use(
  Express.json({
    limit: '200mb',
  })
)
App.use(CookieParser())
App.use(Compression())
// static folder location
App.use(Express.static(path.resolve(`${__dirname}/../public`)))
App.use(Hpp())
App.use(RequestIp.mw())
App.use(UserAgent.express())
App.use(function (req, res, next) {
  new withState(req)
  next()
})

// settup routes
App.use(indexRoutes)
App.use(v3Routes)
// Catch error 404 endpoint not found
App.use('*', function (req, res) {
  throw new Response.Error.NotFound(
    `Sorry, HTTP resource you are looking for was not found.`
  )
})

// Error handler
App.use(function (err, req, res, next) {
  // Set locals, only providing error in development
  const message = err.message

  res.locals.message = message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // Add this line to include winston logging
  winstonLogger.error(
    `${err.status || 500} - ${err.message} - ${req.originalUrl} - ${
      req.method
    } - ${req.ip}`
  )

  const status = err.status || 500

  res.status(status).json({
    message,
  })
})

// rollback transaction sequelize
App.use(async function handleRollbackTransaction(err, req, res, next) {
  try {
    await req.rollbackTransactions()
  } catch (err) {}

  next(err)
})

// setup app port
App.set('port', APP_PORT)

const dbDialect = chalk.cyan(DB_CONNECTION)
const dbName = chalk.cyan(DB_DATABASE)

const server = http.createServer(App)

const onError = (error) => {
  if (error.syscall !== 'listen') {
    throw error
  }

  const bind =
    typeof APP_PORT === 'string' ? `Pipe ${APP_PORT}` : `Port ${APP_PORT}`

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(`${bind} requires elevated privileges`)
      process.exit(1)
      break
    case 'EADDRINUSE':
      console.error(`${bind} is already in use`)
      process.exit(1)
      break
    default:
      throw error
  }
}

const onListening = () => {
  const addr = server.address()
  const bind = typeof addr === 'string' ? `${addr}` : `${addr?.port}`

  const host = chalk.cyan(`http://localhost:${bind}`)

  const msgType = `${APP_NAME}`
  const message = `Server listening on ${host} & ENV: ${chalk.blue(NODE_ENV)}`

  console.log(logServer(msgType, message))
}

db.sequelize
  .authenticate()
  .then(() => {
    const msgType = `Sequelize`
    const message = `Connection ${dbDialect}: ${dbName} has been established successfully.`

    console.log(logServer(msgType, message))
  })
  .catch((err) => {
    const errType = `Sequelize Error:`
    const message = `Unable to connect to the database ${dbDialect}: ${dbName}`

    console.log(logErrServer(errType, message), err)
  })

// Run listener
server.listen(APP_PORT)
server.on('error', onError)
server.on('listening', onListening)
