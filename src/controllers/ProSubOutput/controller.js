import express from 'express'
import AsyncHandler from '../../helpers/AsyncHandler'
import AuthMiddleware from '../../middlewares/AuthMiddleware'
import ProSubOutputService from './service'

const route = express.Router()

route.get(
  '/:id',
  AuthMiddleware,
  AsyncHandler(async function handler(req, res) {
    const { id } = req.params
    const data = await ProSubOutputService.findById(id)
    
    res.json({
      message: 'Data berhasil diambil',
      data,
    })
  })
)

export default route
