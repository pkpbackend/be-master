import express from 'express'
import AsyncHandler from '../../helpers/AsyncHandler'
import AuthMiddleware from '../../middlewares/AuthMiddleware'
import MasterKategoriDokumenService from './service'

const route = express.Router()

route.get(
  '/all',
  AuthMiddleware,
  AsyncHandler(async function handler(req, res) {
    const {
      name,
      description,
      DirektoratId,
    } = req.query

    const data = await MasterKategoriDokumenService.findAll({
      name,
      description,
      DirektoratId,
    })

    res.json({
      message: 'Data berhasil diambil',
      data,
    })
  }))

route.get(
  '/:id',
  AuthMiddleware,
  AsyncHandler(async function handler(req, res) {
    const { id } = req.params
    const data = await MasterKategoriDokumenService.findById(id)
    res.json(data)
  })
)

route.get(
  '/',
  AuthMiddleware,
  AsyncHandler(async function handler(req, res) {
    const data = await MasterKategoriDokumenService.findAllPaginate(req.query)
    res.json(data)
  })
)

route.post(
  '/',
  AuthMiddleware,
  AsyncHandler(async function handler(req, res) {
    const {
      name,
      description,
      DirektoratId,
    } = req.body

    let data = await MasterKategoriDokumenService.create({
      name,
      description,
      DirektoratId,
    })

    res.json({
      id: data?.id
    })
  })
)

route.put(
  '/:id',
  AuthMiddleware,
  AsyncHandler(async function handler(req, res) {
    const { id } = req.params
    const {
      name,
      description,
      DirektoratId,
    } = req.body

    const data = await MasterKategoriDokumenService.update(id, {
      name,
      description,
      DirektoratId,
    })

    res.json({
      id: data?.id
    })
  })
)

route.delete(
  '/:id',
  AuthMiddleware,
  AsyncHandler(async function handler(req, res) {
    const { id } = req.params
    await MasterKategoriDokumenService.delete(id)
    res.json({ message: 'Data berhasil Dihapus' })
  })
)

export default route