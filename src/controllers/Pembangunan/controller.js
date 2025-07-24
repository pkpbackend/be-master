import express from 'express'
import AsyncHandler from '../../helpers/AsyncHandler'
import PembangunanService from './service'
import useMulter from '../../hooks/useMulter'
import { TMP_PATH } from '../../config/env'

const route = express.Router()

const uploadDokumen = useMulter({
  dest: `${TMP_PATH}/`,
}).fields([{ name: 'dokumen', maxCount: 1 }])

route.get(
  '/',
  AsyncHandler(async function handler(req, res) {
    const data = await PembangunanService.getPaginate(req)
    res.json(data)
  })
)

route.get(
  '/:id',
  AsyncHandler(async function handler(req, res) {
    const { id } = req.params
    const data = await PembangunanService.getDetail(id)
    res.json(data)
  })
)

route.put(
  '/:id',
  AsyncHandler(async function handler(req, res) {
    const data = await PembangunanService.update(req)
    res.json(data)
  })
)

route.get(
  '/filter/list',
  AsyncHandler(async function handler(req, res) {
    const data = await PembangunanService.getEmonFilter()
    res.json(data)
  })
)

route.post(
  '/lokasi',
  AsyncHandler(async function handler(req, res) {
    const data = await PembangunanService.createLokasi(req)
    res.json(data)
  })
)

route.get(
  '/lokasi/:id',
  AsyncHandler(async function handler(req, res) {
    const { id } = req.params
    const data = await PembangunanService.getLokasiDetail(id)
    res.json(data)
  })
)

route.put(
  '/lokasi/:id',
  AsyncHandler(async function handler(req, res) {
    const data = await PembangunanService.updateLokasi(req)
    res.json(data)
  })
)

route.delete(
  '/lokasi/:id',
  AsyncHandler(async function handler(req, res) {
    const data = await PembangunanService.deleteLokasi(req)
    res.json(data)
  })
)

route.post(
  '/lokasi/:id/dokumen',
  uploadDokumen,
  AsyncHandler(async function handler(req, res) {
    const { id } = req.params
    const { type } = req.body
    const dokumen = req.files && req.files.dokumen ? req.files.dokumen[0] : null

    const data = await PembangunanService.uploadDokumen(id, { type, dokumen })

    res.json(data)
  })
)

route.get(
  '/export/excel',
  AsyncHandler(async function handler(req, res) {
    const data = await PembangunanService.exportExcel(req)
    res.json(data)
  })
)

route.get(
  '/:id/export/excel',
  AsyncHandler(async function handler(req, res) {
    const { id } = req.params
    const data = await PembangunanService.exportExcelDetail(id)
    res.json(data)
  })
)

export default route
