import express from 'express'
import AsyncHandler from '../../helpers/AsyncHandler'
import DirektoratService from './service'

const route = express.Router()

route.get(
  '/all',
  AsyncHandler(async function handler(req, res) {
    const data = await DirektoratService.findAll()
    res.json(data)
  })
)

route.get(
  '/',
  AsyncHandler(async function handler(req, res) {
    const data = await DirektoratService.findAllPaginate()
    res.json(data)
  })
)

route.get(
  '/:id',
  AsyncHandler(async function handler(req, res) {
    const { id } = req.params
    const data = await DirektoratService.findById(id)
    res.json(data)
  })
)

export default route
