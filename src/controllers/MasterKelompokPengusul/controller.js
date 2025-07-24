import express from 'express'
import AsyncHandler from '../../helpers/AsyncHandler'
import Service from './service'
import AuthMiddleware from '../../middlewares/AuthMiddleware'

const route = express.Router()

route.get(
  '/all',
    AuthMiddleware,
    AsyncHandler(async function handler(req, res) {
    const data = await Service.findAll()
    res.json(data)
  })
)

route.get(
  '/:id',
  AuthMiddleware,
  AsyncHandler(async function handler(req, res) {
    const { id } = req.params
    const data = await Service.findById(id)
    res.json(data)
  })
)

export default route
