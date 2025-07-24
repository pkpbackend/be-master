import express from 'express'
import ProvinsiService from './service'
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
    const data = await ProvinsiService.findAll(req.query, res.locals.profile)
    res.json(data)
  })
)

route.get(
  '/:id',
  AuthMiddleware,
  AsyncHandler(async function handler(req, res) {
    const { id } = req.params
    const data = await ProvinsiService.findById(id)

    res.json(data)
  })
)

route.get(
  '/',
  AuthMiddleware,
  AsyncHandler(async function handler(req, res) {
    const data = await ProvinsiService.findAllPaginate(req)
    res.json(data)
  })
)

route.put(
  '/:id/batas-wilayah-provinsi',
  AuthMiddleware,
  uploadBatasWilayah,
  AsyncHandler(async function handler(req, res) {
    const { id } = req.params

    const batasWilayah =
      req.files && req.files.batasWilayah ? req.files.batasWilayah[0] : null

    const data = await ProvinsiService.uploadGeojson(id, batasWilayah)

    res.json(data)
  })
)

route.post(
  '/',
  AuthMiddleware,
  AsyncHandler(async function handler(req, res) {
    const {
      nama,
      kode_dagri,
      kode_bps,
      kode_rkakl,
      latitude,
      longitude,
      zoom,
    } = req.body

    const data = await ProvinsiService.create({
      nama,
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
      kode_dagri,
      kode_bps,
      kode_rkakl,
      latitude,
      longitude,
      zoom,
    } = req.body

    const data = await ProvinsiService.update(id, {
      nama,
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

    const data = await ProvinsiService.delete(id)

    res.json({ message: 'berhasil delete Provinsi' })
  })
)

export default route
