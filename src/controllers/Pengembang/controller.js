import express from 'express'
import AsyncHandler from '../../helpers/AsyncHandler'
import PengembangService from './service'
import AuthMiddleware from '../../middlewares/AuthMiddleware'

const route = express.Router()

route.get(
  '/all',
  AsyncHandler(async function handler(req, res) {
    const { isValid } = req.query
    const newQuery = {
      isValid,
    }

    if (typeof isValid === 'string') {
      switch (isValid) {
        case 'true':
          newQuery.isValid = true
          break
        case 'false':
          newQuery.isValid = false
      }
    }

    if (typeof isValid === 'number') {
      switch (isValid) {
        case 1:
          newQuery.isValid = true
          break
        case 0:
          newQuery.isValid = false
      }
    }

    const data = await PengembangService.findAll(newQuery)
    res.json(data)
  })
)

route.get(
  '/',
  // AuthMiddleware,
  AsyncHandler(async function handler(req, res) {
    const data = await PengembangService.findAllPaginate(req)
    res.json(data)
  })
)

route.get(
  '/:id',
  AsyncHandler(async function handler(req, res) {
    const { id } = req.params
    const data = await PengembangService.findById(id)
    res.json(data)
  })
)

route.get(
  '/npwp/:npwp',
  AsyncHandler(async function handler(req, res) {
    const { npwp } = req.params
    const data = await PengembangService.findByNPWP(npwp)
    res.json(data)
  })
)

route.get(
  '/npwporemail/:npwp/:email',
  AsyncHandler(async function handler(req, res) {
    const { npwp, email } = req.params
    const data = await PengembangService.findByNPWPorEmail({
      npwp,
      email,
    })
    res.json(data)
  })
)

route.put(
  '/:id',
  AsyncHandler(async function handler(req, res) {
    const { id } = req.params
    const { nama, namaPerusahaan, telpPenanggungJawab, email, npwp } = req.body

    const data = await PengembangService.update(id, {
      nama,
      namaPerusahaan,
      telpPenanggungJawab,
      email,
      npwp,
    })
    res.json(data)
  })
)

route.delete(
  '/:id',
  AsyncHandler(async function handler(req, res) {
    const { id } = req.params
    await PengembangService.delete(id)
    res.json({ message: 'Data berhasil Dihapus' })
  })
)

route.post(
  '/',
  AsyncHandler(async function handler(req, res) {
    const data = await PengembangService.create(req)
    res.json(data)
  })
)

export default route
