import express from 'express'
import AsyncHandler from '../../helpers/AsyncHandler'
import MasterKegiatanService from './service'

const route = express.Router()

route.get(
  '/',
  AsyncHandler(async function handler(req, res) {
    const { query } = req
    const data = await MasterKegiatanService.findAll(query)
    res.json(data)
  })
)

route.get(
  '/:id',
  AsyncHandler(async function handler(req, res) {
    const { id } = req.params
    const data = await MasterKegiatanService.findById(id)
    res.json(data)
  })
)

export default route
