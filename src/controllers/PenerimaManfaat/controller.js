import express from 'express'
import AsyncHandler from '../../helpers/AsyncHandler'
import PenerimaManfaatService from './service'

const route = express.Router()

route.get(
  '/',
  AsyncHandler(async function handler(req, res) {
    const data = await PenerimaManfaatService.findAll(req)
    res.json(data)
  })
)

route.get(
  '/:id',
  AsyncHandler(async function handler(req, res) {
    const { id } = req.params
    const data = await PenerimaManfaatService.findById(id)
    res.json(data)
  })
)

export default route
