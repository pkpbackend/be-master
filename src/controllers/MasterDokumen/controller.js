import express from 'express'
import MasterDokumenService from './service'
import AsyncHandler from '../../helpers/AsyncHandler'
import AuthMiddleware from '../../middlewares/AuthMiddleware'

const route = express.Router()

route.get(
  '/all',
  AuthMiddleware,
  AsyncHandler(async function handler(req, res) {
    const { nama, model, DirektoratId } = req.query

    const data = await MasterDokumenService.findAll({
      nama,
      model,
      DirektoratId,
      req,
    })

    res.json({
      message: 'Data berhasil diambil',
      data,
    })
  })
)

route.get(
  '/serahterima/:serahTerimaType',
  AsyncHandler(async function handler(req, res) {
    const { serahTerimaType } = req.params
    const data = await MasterDokumenService.findAllSerahTerimaDokumen(
      serahTerimaType
    )
    res.json({
      message: 'Data berhasil diambil',
      data,
    })
  })
)

route.get(
  '/:id',
  AuthMiddleware,
  AsyncHandler(async function handler(req, res) {
    const { id } = req.params
    const data = await MasterDokumenService.findById(id)

    res.json(data)
  })
)

route.get(
  '/',
  AuthMiddleware,
  AsyncHandler(async function handler(req, res) {
    const data = await MasterDokumenService.findAllPaginate(req.query)
    res.json(data)
  })
)

route.post(
  '/',
  AuthMiddleware,
  AsyncHandler(async function handler(req, res) {
    const {
      nama,
      model,
      jenisData,
      jenisDirektif,
      required,
      type,
      MasterKategoriDokumenId,
      maxSize,
      typeFile,
      ditRusunField,
      jenisBantuan,
      sort,
      formatDokumen,
    } = req.body

    let data = await MasterDokumenService.create({
      nama,
      model,
      jenisData,
      jenisDirektif,
      required,
      type,
      MasterKategoriDokumenId,
      maxSize,
      typeFile,
      ditRusunField,
      jenisBantuan,
      sort,
      formatDokumen,
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
      nama,
      model,
      jenisData,
      jenisDirektif,
      required,
      type,
      MasterKategoriDokumenId,
      maxSize,
      typeFile,
      ditRusunField,
      jenisBantuan,
      sort,
      formatDokumen,
    } = req.body
    const data = await MasterDokumenService.update(id, {
      nama,
      model,
      jenisData,
      jenisDirektif,
      required,
      type,
      MasterKategoriDokumenId,
      maxSize,
      typeFile,
      ditRusunField,
      jenisBantuan,
      sort,
      formatDokumen,
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
    await MasterDokumenService.delete(id)
    res.json({ message: 'Data berhasil Dihapus' })
  })
)

export default route
