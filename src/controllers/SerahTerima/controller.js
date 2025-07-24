import express from 'express'
import AsyncHandler from '../../helpers/AsyncHandler'
import AuthMiddleware from '../../middlewares/AuthMiddleware'
import useMulter from '../../hooks/useMulter'
import { TMP_PATH } from '../../config/env'
import SerahTerimaService from './service'

const route = express.Router()

const uploadSpreadsheetFile = useMulter({
  dest: `${TMP_PATH}/`,
}).fields([{ name: 'spreadsheetFile', maxCount: 1 }])

route.post(
  '/import',
  AuthMiddleware,
  uploadSpreadsheetFile,
  AsyncHandler(async function handler(req, res) {
    const spreadsheetFile =
      req.files && req.files.spreadsheetFile ? req.files.spreadsheetFile[0] : null

    const data = await SerahTerimaService.importSpreadsheetFile(spreadsheetFile)

    res.json(data)
  })
)

route.post(
  '/rusus',
  AuthMiddleware,
  AsyncHandler(async function handler(req, res) {
    const { accessTokenInternal } = res.locals
    return await SerahTerimaService.createSerahTerimaDirektorat(
      'rusus',
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
    return await SerahTerimaService.updateSerahTerimaDirektorat(
      'rusus',
      req,
      res,
      accessTokenInternal
    )
  })
)

route.post(
  '/:id/comment',
  AuthMiddleware,
  AsyncHandler(async function handler(req, res) {
    const { id: SerahTerimaId } = req.params
    const { message } = req.body
    const { id, nama, username, email, instansi, alamatInstansi } =
      res.locals.profile

    const data = await SerahTerimaService.createComment({
      message,
      SerahTerimaId,
      UserId: id,
      User: {
        id,
        nama,
        username,
        email,
        instansi,
        alamatInstansi,
      },
    })

    res.json(data)
  })
)

route.get(
  '/:id/download-pdf',
  AuthMiddleware,
  AsyncHandler(async function handler(req, res) {
    const { id } = req.params
    const { accessTokenInternal } = res.locals
    const data = await SerahTerimaService.downloadPdf(id, accessTokenInternal)
    res.setHeader('Content-Type', 'application/pdf')
    res.download(data.file)
  })
)

route.get(
  '/dashboard',
  AuthMiddleware,
  AsyncHandler(async function handler(req, res) {
    const { dashboardtipe } = req.query
    if (dashboardtipe && dashboardtipe == 'bar') {
      const data = await SerahTerimaService.getSerahTerimaGroupByYear(req)
      return res.json(data)
    }
    const data = await SerahTerimaService.getSerahTerimaDashboard(req.query)
    res.json(data)
  })
)

route.get(
  '/dashboard/map',
  AuthMiddleware,
  AsyncHandler(async function handler(req, res) {
    const data = await SerahTerimaService.getDashboardMap(req.query)
    res.json(data)
  })
)

route.get(
  '/export/excel',
  AuthMiddleware,
  AsyncHandler(async function handler(req, res) {
    const s3url = await SerahTerimaService.exportExcel(req, res)
    res.json({ s3url })
  })
)

route.post(
  '/notification',
  AuthMiddleware,
  AsyncHandler(async function handler(req, res) {
    const data = await SerahTerimaService.sendNotifKelengkapan(req, res)
    res.json(data)
  })
)

export default route
