import express from 'express'
import { APP_NAME } from '../../config/env'
import AsyncHandler from '../../helpers/AsyncHandler'

const route = express.Router()

route.get(
  '/',
  AsyncHandler(async function findAll(req, res) {
    return res.json({
      APP_NAME,
    })
  })
)

export default route
