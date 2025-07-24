import express from 'express'
import DesaService from './service'
import AuthMiddleware from '../../middlewares/AuthMiddleware'
import AsyncHandler from '../../helpers/AsyncHandler'
import useMulter from '../../hooks/useMulter'
import { TMP_PATH } from '../../config/env'

const route = express.Router()

const uploadBatasWilayah = useMulter({
  dest: `${TMP_PATH}/`,
}).fields([{ name: 'batasWilayah', maxCount: 1 }])

route.get(
  '/all',
  AuthMiddleware,
  AsyncHandler(async function handler(req, res) {
    const data = await DesaService.findAll(req)
    res.json(data)
  })
)

route.get(
  '/:id',
  AsyncHandler(async function handler(req, res) {
    const { id } = req.params
    const data = await DesaService.findById(id)

    res.json(data)
  })
)

route.get(
  '/',
  AsyncHandler(async function handler(req, res) {
    const data = await DesaService.findAllPaginate(req)
    res.json(data)
  })
)

route.put(
  '/:id/batas-wilayah-desa',
  AuthMiddleware,
  uploadBatasWilayah,
  AsyncHandler(async function handler(req, res) {
    const { id } = req.params

    const batasWilayah =
      req.files && req.files.batasWilayah ? req.files.batasWilayah[0] : null

    const data = await DesaService.uploadGeojson(id, batasWilayah)

    res.json(data)
  })
)

route.post(
  '/',
  AuthMiddleware,
  AsyncHandler(async function handler(req, res) {
    const {
      nama,
      KecamatanId,
      kode_dagri,
      kode_bps,
      kode_rkakl,
      latitude,
      longitude,
      zoom,
    } = req.body

    const data = await DesaService.create({
      nama,
      KecamatanId,
      kode_dagri,
      kode_bps,
      kode_rkakl,
      latitude,
      longitude,
      zoom,
    })

    res.json(data)
  })
)

route.put(
  '/:id',
  AuthMiddleware,
  AsyncHandler(async function handler(req, res) {
    const { id } = req.params

    const {
      nama,
      KecamatanId,
      kode_dagri,
      kode_bps,
      kode_rkakl,
      latitude,
      longitude,
      zoom,
    } = req.body

    const data = await DesaService.update(id, {
      nama,
      KecamatanId,
      kode_dagri,
      kode_bps,
      kode_rkakl,
      latitude,
      longitude,
      zoom,
    })

    res.json(data)
  })
)

route.delete(
  '/:id',
  AuthMiddleware,
  AsyncHandler(async function handler(req, res) {
    const { id } = req.params

    const data = await DesaService.delete(id)

    res.json({ message: 'berhasil delete Desa' })
  })
)

export default route
