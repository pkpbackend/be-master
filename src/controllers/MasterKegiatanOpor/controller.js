import express from 'express'
import AsyncHandler from '../../helpers/AsyncHandler'
import Service from './service'

const route = express.Router()

route.get(
  '/all',
  AsyncHandler(async function handler(req, res) {
    const { query } = req
    const data = await Service.findAll(query)
    res.json(data)
  })
)

route.get(
  '/:id',
  AsyncHandler(async function handler(req, res) {
    const { id } = req.params
    const data = await Service.findById(id)
    res.json(data)
  })
)

export default route
