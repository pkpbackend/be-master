import express from 'express'
import AsyncHandler from '../../helpers/AsyncHandler'
import KecamatanService from './service'
import { TMP_PATH } from '../../config/env'
import useMulter from '../../hooks/useMulter'
import AuthMiddleware from '../../middlewares/AuthMiddleware'

const uploadBatasWilayah = useMulter({
  dest: `${TMP_PATH}/`,
}).fields([{ name: 'batasWilayah', maxCount: 1 }])

const route = express.Router()

route.get(
  '/all',
  AuthMiddleware,
  AsyncHandler(async function handler(req, res) {
    const data = await KecamatanService.findAll(req)
    res.json(data)
  })
)

route.get(
  '/',
  AsyncHandler(async function handler(req, res) {
    const data = await KecamatanService.findAllPaginate(req)
    res.json(data)
  })
)

route.get(
  '/:id',
  AsyncHandler(async function handler(req, res) {
    const { id } = req.params
    const data = await KecamatanService.findById(id)

    res.json(data)
  })
)

route.post(
  '/',
  AsyncHandler(async function handler(req, res) {
    const {
      nama,
      CityId,
      latitude,
      longitude,
      zoom,
      kode_dagri,
      kode_bps,
      kode_rkakl,
    } = req.body
    const data = await KecamatanService.create({
      nama,
      CityId,
      latitude,
      longitude,
      zoom,
      kode_dagri,
      kode_bps,
      kode_rkakl,
    })
    res.json(data)
  })
)

route.put(
  '/:id',
  AsyncHandler(async function handler(req, res) {
    const { id } = req.params
    const {
      nama,
      CityId,
      latitude,
      longitude,
      zoom,
      kode_dagri,
      kode_bps,
      kode_rkakl,
    } = req.body
    const data = await KecamatanService.update(id, {
      nama,
      CityId,
      latitude,
      longitude,
      zoom,
      kode_dagri,
      kode_bps,
      kode_rkakl,
    })
    res.json(data)
  })
)

route.put(
  '/:id/upload',
  uploadBatasWilayah,
  AsyncHandler(async function handler(req, res) {
    const { id } = req.params
    const batasWilayah =
      req.files && req.files.batasWilayah ? req.files.batasWilayah[0] : null
    const data = await KecamatanService.uploadGeojson(id, batasWilayah)
    res.json(data)
  })
)

route.delete(
  '/:id',
  AsyncHandler(async function handler(req, res) {
    const { id } = req.params
    await KecamatanService.delete(id)
    res.json({ message: 'Data berhasil Dihapus' })
  })
)

export default route
