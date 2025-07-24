import express from 'express'
import AsyncHandler from '../../helpers/AsyncHandler'
import AuthMiddleware from '../../middlewares/AuthMiddleware'
import FilterService from './service'

const route = express.Router()

route.get(
  '/kro',
  AuthMiddleware,
  AsyncHandler(async function handler(req, res) {
    const { ...filter } = req.query
    const data = await FilterService.findAllKro(filter)
    res.json(data)
  })
)

route.get(
  '/ro',
  AuthMiddleware,
  AsyncHandler(async function handler(req, res) {
    const { ...filter } = req.query
    const data = await FilterService.findAllRo(filter)
    res.json(data)
  })
)

export default route
