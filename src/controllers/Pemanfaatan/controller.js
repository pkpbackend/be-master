import express from 'express'
import { TMP_PATH } from '../../config/env'
import AsyncHandler from '../../helpers/AsyncHandler'
import useMulter from '../../hooks/useMulter'
import AuthMiddleware from '../../middlewares/AuthMiddleware'
import Service from './service'

const uploadDokumen = useMulter({
  dest: `${TMP_PATH}/`,
}).fields([{ name: 'dokumen', maxCount: 1 }])

const route = express.Router()

route.get(
  '/',
  AuthMiddleware,
  AsyncHandler(async function handler(req, res) {
    return await Service.findAllPaginate(req, res)
  })
)

route.get(
  '/export/excel',
  AuthMiddleware,
  AsyncHandler(async function handler(req, res) {
    const s3url = await Service.exportExcel(req, res)
    res.json({ s3url })
  })
)

route.get(
  '/export/excel/kegiatan',
  AuthMiddleware,
  AsyncHandler(async function handler(req, res) {
    const s3url = await Service.exportExcelKegiatan(req.query)
    res.json({ s3url })
  })
)

route.get(
  '/getfiltertahun',
  AuthMiddleware,
  AsyncHandler(async function handler(req, res) {
    return await Service.getFilterTahun(req, res)
  })
)

route.get(
  '/getfilterkuning',
  AuthMiddleware,
  AsyncHandler(async function handler(req, res) {
    return await Service.getFilterKuning(req, res)
  })
)

route.get(
  '/getfilter',
  AuthMiddleware,
  AsyncHandler(async function handler(req, res) {
    return await Service.getFilterMaster(req, res)
  })
)

route.get(
  '/masterinput',
  AuthMiddleware,
  AsyncHandler(async function handler(req, res) {
    return await Service.getMasterInput(req, res)
  })
)

route.get(
  '/:id',
  AuthMiddleware,
  AsyncHandler(async function handler(req, res) {
    const { id } = req.params
    const { withSerahTerimaIds } = req.query

    const data = await Service.findById(id, withSerahTerimaIds)
    
    res.json(data)
  })
)

// ---| PEMANFAATAN GET FILTER DIREKTORAT
route.get(
  '/swadaya/filter',
  AuthMiddleware,
  AsyncHandler(async function handler(req, res) {
    return await Service.getFilterDirektorat(req, res)
  })
)

route.get(
  '/rusus/filter',
  AuthMiddleware,
  AsyncHandler(async function handler(req, res) {
    return await Service.getFilterDirektorat(req, res)
  })
)

route.get(
  '/rusun/filter',
  AuthMiddleware,
  AsyncHandler(async function handler(req, res) {
    return await Service.getFilterDirektorat(req, res)
  })
)

route.get(
  '/ruk/filter',
  AuthMiddleware,
  AsyncHandler(async function handler(req, res) {
    return await Service.getFilterDirektorat(req, res)
  })
)

// ---| PEMANFAATAN GET ALL DIREKTORAT
route.get(
  '/swadaya',
  AuthMiddleware,
  AsyncHandler(async function handler(req, res) {
    return await Service.getAllProfileDirektorat('ruswa', req, res)
  })
)

route.get(
  '/rusus',
  AuthMiddleware,
  AsyncHandler(async function handler(req, res) {
    return await Service.getAllProfileDirektorat('rusus', req, res)
  })
)

route.get(
  '/rusun',
  AuthMiddleware,
  AsyncHandler(async function handler(req, res) {
    return await Service.getAllProfileDirektorat('rusun', req, res)
  })
)

route.get(
  '/ruk',
  AuthMiddleware,
  AsyncHandler(async function handler(req, res) {
    return await Service.getAllProfileDirektorat('ruk', req, res)
  })
)

// ---| PEMANFAATAN GET DETAIL DIREKTORAT

route.get(
  '/swadaya/:id',
  AuthMiddleware,
  AsyncHandler(async function handler(req, res) {
    return await Service.getProfileDetailDirektorat('ruswa', req, res)
  })
)

route.get(
  '/rusus/:id',
  AuthMiddleware,
  AsyncHandler(async function handler(req, res) {
    return await Service.getProfileDetailDirektorat('rusus', req, res)
  })
)

route.get(
  '/rusun/:id',
  AuthMiddleware,
  AsyncHandler(async function handler(req, res) {
    return await Service.getProfileDetailDirektorat('rusun', req, res)
  })
)

route.get(
  '/ruk/:id',
  AuthMiddleware,
  AsyncHandler(async function handler(req, res) {
    return await Service.getProfileDetailDirektorat('ruk', req, res)
  })
)

route.post(
  '/swadaya',
  AuthMiddleware,
  AsyncHandler(async function handler(req, res) {
    const { accessTokenInternal } = res.locals
    const userActive = res.locals?.profile
    return await Service.createPemanfaatanDirektorat(
      'ruswa',
      req,
      res,
      userActive,
      accessTokenInternal
    )
  })
)

route.post(
  '/rusus',
  AuthMiddleware,
  AsyncHandler(async function handler(req, res) {
    const { accessTokenInternal } = res.locals
    const userActive = res.locals?.profile
    return await Service.createPemanfaatanDirektorat(
      'rusus',
      req,
      res,
      userActive,
      accessTokenInternal
    )
  })
)

route.post(
  '/rusun',
  AuthMiddleware,
  AsyncHandler(async function handler(req, res) {
    const { accessTokenInternal } = res.locals
    const userActive = res.locals?.profile
    return await Service.createPemanfaatanDirektorat(
      'rusun',
      req,
      res,
      userActive,
      accessTokenInternal
    )
  })
)

route.post(
  '/ruk',
  AuthMiddleware,
  AsyncHandler(async function handler(req, res) {
    const { accessTokenInternal } = res.locals
    const userActive = res.locals?.profile
    return await Service.createPemanfaatanDirektorat(
      'ruk',
      req,
      res,
      userActive,
      accessTokenInternal
    )
  })
)

route.put(
  '/swadaya/:id',
  AuthMiddleware,
  AsyncHandler(async function handler(req, res) {
    const { accessTokenInternal } = res.locals
    return await Service.updatePemanfaatanDirektorat(
      'ruswa',
      req,
      res,
      accessTokenInternal
    )
  })
)

route.put(
  '/rusus/:id',
  AuthMiddleware,
  AsyncHandler(async function handler(req, res) {
    const { accessTokenInternal } = res.locals
    return await Service.updatePemanfaatanDirektorat(
      'rusus',
      req,
      res,
      accessTokenInternal
    )
  })
)

route.put(
  '/rusun/:id',
  AuthMiddleware,
  AsyncHandler(async function handler(req, res) {
    const { accessTokenInternal } = res.locals
    return await Service.updatePemanfaatanDirektorat(
      'rusun',
      req,
      res,
      accessTokenInternal
    )
  })
)

route.put(
  '/ruk/:id',
  AuthMiddleware,
  AsyncHandler(async function handler(req, res) {
    const { accessTokenInternal } = res.locals
    return await Service.updatePemanfaatanDirektorat(
      'ruk',
      req,
      res,
      accessTokenInternal
    )
  })
)

route.put(
  '/:id/dokumen',
  AuthMiddleware,
  uploadDokumen,
  AsyncHandler(async function handler(req, res) {
    const { id } = req.params
    const { nama, type, keterangan } = req.body
    const dokumen = req.files && req.files.dokumen ? req.files.dokumen[0] : null

    const data = await Service.uploadDokumen(id, {
      nama,
      type,
      dokumen,
      keterangan,
    })

    res.json(data)
  })
)

route.put(
  '/:id/dokumen/info',
  AuthMiddleware,
  AsyncHandler(async function handler(req, res) {
    const { id } = req.params
    const { nama, type, keterangan } = req.body

    const data = await Service.updateDokumenInfo(id, {
      nama,
      type,
      keterangan,
    })

    res.json(data)
  })
)

route.put(
  '/:id/status',
  AuthMiddleware,
  AsyncHandler(async function handler(req, res) {
    const { id } = req.params
    const { status } = req.body
    const userActive = res.locals?.profile

    const data = await Service.updateStatus(id, {
      status,
    }, userActive)

    res.json(data)
  })
)

route.put(
  '/update/statustype/:id',
  AsyncHandler(async function handler(req, res) {
    const { id } = req.params
    const data = await Service.updateStatusType(id, req.body)
    res.json(data)
  })
)

route.delete(
  '/:id/dokumen',
  AuthMiddleware,
  AsyncHandler(async function handler(req, res) {
    const { id } = req.params
    const { nama, type } = req.body

    const data = await Service.deleteDokumen(id, { nama, type })

    res.json(data)
  })
)

// ---| DELETE PEMANFAATAN
route.delete(
  '/:id',
  AuthMiddleware,
  AsyncHandler(async function handler(req, res) {
    return await Service.hapusPemanfaatan(req, res)
  })
)

route.delete(
  '/swadaya/:id',
  AuthMiddleware,
  AsyncHandler(async function handler(req, res) {
    return await Service.deletePemanfaatanDirektorat('ruswa', req, res)
  })
)

route.delete(
  '/rusus/:id',
  AuthMiddleware,
  AsyncHandler(async function handler(req, res) {
    return await Service.deletePemanfaatanDirektorat('rusus', req, res)
  })
)
// test
route.delete(
  '/rusun/:id',
  AuthMiddleware,
  AsyncHandler(async function handler(req, res) {
    return await Service.deletePemanfaatanDirektorat('rusun', req, res)
  })
)

route.delete(
  '/ruk/:id',
  AuthMiddleware,
  AsyncHandler(async function handler(req, res) {
    return await Service.deletePemanfaatanDirektorat('ruk', req, res)
  })
)

export default route
