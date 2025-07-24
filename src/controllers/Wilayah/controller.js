import express from 'express'
import AsyncHandler from '../../helpers/AsyncHandler'
import WilayahService from './service'

const route = express.Router()

route.get(
  '/provinsi',
  AsyncHandler(async function handler(req, res) {
    const data = await WilayahService.findAllProvinsi(req)
    res.json(data)
  })
)

route.get(
  '/provinsi/:id',
  AsyncHandler(async function handler(req, res) {
    const data = await WilayahService.findOneProvinsi(req)
    res.json(data)
  })
)

route.get(
  '/city',
  AsyncHandler(async function handler(req, res) {
    const data = await WilayahService.findAllCity(req)
    res.json(data)
  })
)

route.get(
  '/city/:id',
  AsyncHandler(async function handler(req, res) {
    const data = await WilayahService.findOneCity(req)
    res.json(data)
  })
)

route.get(
  '/kecamatan',
  AsyncHandler(async function handler(req, res) {
    const data = await WilayahService.findAllKecamatan(req)
    res.json(data)
  })
)

route.get(
  '/kecamatan/:id',
  AsyncHandler(async function handler(req, res) {
    const data = await WilayahService.findOneKecamatan(req)
    res.json(data)
  })
)

route.get(
  '/desa',
  AsyncHandler(async function handler(req, res) {
    const data = await WilayahService.findAllDesa(req)
    res.json(data)
  })
)

route.get(
  '/desa/:id/rtlh',
  AsyncHandler(async function handler(req, res) {
    const { id } = req.params
    const data = await WilayahService.findRTLH(id)
    res.json(data)
  })
)

route.get(
  '/desa/:id',
  AsyncHandler(async function handler(req, res) {
    const data = await WilayahService.findOneDesa(req)
    res.json(data)
  })
)

export default route
