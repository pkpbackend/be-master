import express from 'express'
import AsyncHandler from '../../helpers/AsyncHandler'
import PerusahaanService from './service'

const route = express.Router()

route.get(
  '/',
  AsyncHandler(async function handler(req, res) {
    const data = await PerusahaanService.findAll(req.query)
    res.json(data)
  })
)

route.get(
  '/:id',
  AsyncHandler(async function handler(req, res) {
    const { id } = req.params
    const data = await PerusahaanService.findById(id)
    res.json(data)
  })
)

route.post(
  '/',
  AsyncHandler(async function createHandler(req, res) {
    const {
      name,
      asosiasi,
      alamat,
      kodePos,
      rtRw,
      namaDirektur,
      telpKantor,
      telpDirektur,
      telpPenanggungJawab,
      email,
      website,
      npwp,
      ProvinsiId,
      CityId,
      DesaId,
      KecamatanId,
    } = req.body

    const data = await PerusahaanService.create({
      name,
      asosiasi,
      alamat,
      kodePos,
      rtRw,
      namaDirektur,
      telpKantor,
      telpDirektur,
      telpPenanggungJawab,
      email,
      website,
      npwp,
      ProvinsiId,
      CityId,
      DesaId,
      KecamatanId,
    })

    res.json(data)
  })
)

export default route
