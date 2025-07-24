import express from 'express'
import AsyncHandler from '../../helpers/AsyncHandler'
import MasterTematikService from './service'
import AuthMiddleware from '../../middlewares/AuthMiddleware'

const route = express.Router()

route.get(
  '/:id',
  AuthMiddleware,
  AsyncHandler(async function handler(req, res) {
    const { id } = req.params
    const data = await MasterTematikService.findById(id)
    res.json(data)
  })
)

export default route
