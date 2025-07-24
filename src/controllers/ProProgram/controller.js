import express from 'express'
import AsyncHandler from '../../helpers/AsyncHandler'
import AuthMiddleware from '../../middlewares/AuthMiddleware'
import ProprogramService from './service'

const route = express.Router()

route.get(
  '/',
  AuthMiddleware,
  AsyncHandler(async function handler(req, res) {
    const { id } = req.params
    const data = await ProprogramService.findAll(req, res)

    res.json({
      message: 'Data berhasil diambil',
      data,
    })
  })
)

route.get(
  '/:id',
  AuthMiddleware,
  AsyncHandler(async function handler(req, res) {
    const { id } = req.params
    const data = await ProprogramService.findById(id)

    res.json({
      message: 'Data berhasil diambil',
      data,
    })
  })
)

export default route
