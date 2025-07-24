import express from 'express'
import AsyncHandler from '../../helpers/AsyncHandler'
import AuthMiddleware from '../../middlewares/AuthMiddleware'
import Service from './service'

const route = express.Router()

route.get(
  '/map',
  AsyncHandler(async function handler(req, res) {
    const data = await Service.findAllMap(req.query)

    res.json({
      message: 'Data berhasil diambil',
      data,
    })
  })
)

route.get(
  '/pemanfaatan/summary',
  AsyncHandler(async function handler(req, res) {
    const data = await Service.findSummary(req.query)
    res.json(data)
  })
)

route.get(
  '/pemanfaatan/rekap',
  AuthMiddleware,
  AsyncHandler(async function handler(req, res) {
    const dataRekap = await Service.findRekap(req.query)
    const dataRekapPerTahun = await Service.findRekapPerTahun(req.query)
    res.json({
      dataRekap,
      dataRekapPerTahun,
    })
  })
)

route.get(
  '/pemanfaatan/rekap/export/excel',
  AuthMiddleware,
  AsyncHandler(async function handler(req, res) {
    const { s3url } = await Service.exportExcelRekap(req.query)
    res.json({
      s3url,
    })
  })
)

route.get(
  '/pemanfaatan/rekap-per-tahun/export/excel',
  AuthMiddleware,
  AsyncHandler(async function handler(req, res) {
    const { s3url } = await Service.exportExcelRekapPerTahun(req.query)
    res.json({
      s3url,
    })
  })
)

route.get(
  '/pemanfaatan/rekap/detail',
  AsyncHandler(async function handler(req, res) {
    const data = await Service.findRekapDetail(req.query)
    res.json(data)
  })
)

route.get(
  '/pemanfaatan/rekap/per-provinsi-dan-kategori',
  AuthMiddleware,
  AsyncHandler(async function handler(req, res) {
    const data = await Service.findRekapPerProvinsiDanKategori(req.query)
    res.json(data)
  })
)

route.get(
  '/pemanfaatan/rekap-pengisian-data',
  AuthMiddleware,
  AsyncHandler(async function handler(req, res) {
    const data = await Service.findRekapPengisianData(req.query)
    res.json(data)
  })
)

route.get(
  '/pemanfaatan/rekap-pengisian-data/export/excel',
  AuthMiddleware,
  AsyncHandler(async function handler(req, res) {
    const { s3url } = await Service.exportExcelRekapPengisianData(req.query)
    res.json({
      s3url,
    })
  })
)

route.get(
  '/pemanfaatan/rekap-keterisian',
  AuthMiddleware,
  AsyncHandler(async function handler(req, res) {
    const data = await Service.findRekapKeterisian(req.query)
    res.json(data)
  })
)

route.get(
  '/pemanfaatan/rekap-keterisian/export/excel',
  AuthMiddleware,
  AsyncHandler(async function handler(req, res) {
    const { s3url } = await Service.exportExcelRekapKeterisian(req.query)
    res.json({ s3url })
  })
)

route.get(
  '/pemanfaatan/rekap-keterisian/per-provinsi',
  AuthMiddleware,
  AsyncHandler(async function handler(req, res) {
    const data = await Service.findRekapKeterisianPerProvinsi(req.query)
    res.json(data)
  })
)

route.get(
  '/pemanfaatan/rekap-keterisian/per-provinsi/export/excel',
  AuthMiddleware,
  AsyncHandler(async function handler(req, res) {
    const { s3url } = await Service.exportExcelRekapKeterisianPerProvinsi(
      req.query
    )
    res.json({ s3url })
  })
)

route.get(
  '/pemanfaatan/rekap-peresmian',
  AuthMiddleware,
  AsyncHandler(async function handler(req, res) {
    const data = await Service.findRekapPeresmian(req.query)
    res.json(data)
  })
)

route.get(
  '/profile/rp3kp',
  AuthMiddleware,
  AsyncHandler(async function handler(req, res) {
    const data = await Service.findRp3kp(req.query)
    res.json(data)
  })
)

route.get(
  '/profile/pokja-pkp',
  AuthMiddleware,
  AsyncHandler(async function handler(req, res) {
    const data = await Service.findPokjaPkp(req.query)
    res.json(data)
  })
)

route.get(
  '/profile/forum-pkp',
  AuthMiddleware,
  AsyncHandler(async function handler(req, res) {
    const data = await Service.findForumPkp(req.query)
    res.json(data)
  })
)

route.get(
  '/profile/rekap-p3ke',
  AuthMiddleware,
  AsyncHandler(async function handler(req, res) {
    const data = await Service.rekapP3KEProvinsi()
    res.json(data)
  })
)

route.get(
  '/profile/rekap-p3ke-kabkota',
  AuthMiddleware,
  AsyncHandler(async function handler(req, res) {
    const data = await Service.rekapP3KEKabKota(req)
    res.json(data)
  })
)

export default route
