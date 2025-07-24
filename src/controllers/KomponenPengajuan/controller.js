import express from 'express'
import AsyncHandler from '../../helpers/AsyncHandler'
import KomponenPengajuanService from './service'

const route = express.Router()

route.get(
  '/',
  AsyncHandler(async function handler(req, res) {
    return await KomponenPengajuanService.findAll(req, res)
  })
)

route.get(
  '/:id',
  AsyncHandler(async function handler(req, res) {
    const { id } = req.params
    const data = await KomponenPengajuanService.findById(id)
    res.json({ message: 'Data berhasil diambil', data })
  })
)

route.post(
  '/',
  AsyncHandler(async function handler(req, res) {
    const { name, UsulanTypeId } = req.body
    const data = await KomponenPengajuanService.create({
      name,
      UsulanTypeId,
    })
    res.json({ message: 'Data berhasil ditambahkan', data })
  })
)

route.put(
  '/:id',
  AsyncHandler(async function handler(req, res) {
    const { id } = req.params
    const data = {
      name: req.body.name,
      UsulanTypeId: req.body.UsulanTypeId,
    }
    const newData = await KomponenPengajuanService.update(id, data)
    res.json({ message: 'Data berhasil diupdate', data: newData })
  })
)

route.delete(
  '/:id',
  AsyncHandler(async function handler(req, res) {
    const { id } = req.params
    await KomponenPengajuanService.delete(id)
    res.json({ message: 'Data berhasil Dihapus' })
  })
)

export default route
