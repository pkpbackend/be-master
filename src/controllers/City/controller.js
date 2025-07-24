import express from 'express'
import AsyncHandler from '../../helpers/AsyncHandler'
import CityService from './service'
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
    const data = await CityService.findAll(req.query, res.locals.profile)
    res.json(data)
  })
)

route.get(
  '/',
  AsyncHandler(async function handler(req, res) {
    const data = await CityService.findAllPaginate(req)
    res.json(data)
  })
)

route.get(
  '/:id',
  AsyncHandler(async function handler(req, res) {
    const { id } = req.params
    const data = await CityService.findById(id)

    res.json(data)
  })
)

route.post(
  '/',
  AsyncHandler(async function handler(req, res) {
    const {
      nama,
      ProvinsiId,
      latitude,
      longitude,
      zoom,
      kode_dagri,
      kode_bps,
      kode_rkakl,
    } = req.body

    const data = await CityService.create({
      nama,
      ProvinsiId,
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
      ProvinsiId,
      latitude,
      longitude,
      zoom,
      kode_dagri,
      kode_bps,
      kode_rkakl,
    } = req.body
    const data = await CityService.update(id, {
      nama,
      ProvinsiId,
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
    const data = await CityService.uploadGeojson(id, batasWilayah)
    res.json(data)
  })
)

route.delete(
  '/:id',
  AsyncHandler(async function handler(req, res) {
    const { id } = req.params
    await CityService.delete(id)
    res.json({ message: 'Data berhasil Dihapus' })
  })
)

export default route
