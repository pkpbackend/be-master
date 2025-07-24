import express from 'express'
import AsyncHandler from '../../helpers/AsyncHandler'
import ExApiService from './service'

const route = express.Router()

route.get(
  '/pemanfaatan/master',
  AsyncHandler(async function handler(req, res) {
    const data = await ExApiService.findPemanfaatanMaster(req.query)
    res.json(data)
  })
)

route.get(
  '/pemanfaatan/rusunawa',
  AsyncHandler(async function handler(req, res) {
    const data = await ExApiService.findPemanfaatanRusunawa(req.query)
    res.json(data)
  })
)

route.get(
  '/pemanfaatan/rusus',
  AsyncHandler(async function handler(req, res) {
    const data = await ExApiService.findPemanfaatanRusus(req.query)
    res.json(data)
  })
)

route.get(
  '/pemanfaatan/bsps',
  AsyncHandler(async function handler(req, res) {
    const data = await ExApiService.findPemanfaatanBsps(req.query)
    res.json(data)
  })
)

route.get(
  '/pemanfaatan/psu',
  AsyncHandler(async function handler(req, res) {
    const data = await ExApiService.findPemanfaatanPsu(req.query)
    res.json(data)
  })
)

route.get(
  '/rtlh/data-rtlh',
  AsyncHandler(async function handler(req, res) {
    const data = await ExApiService.findDataRTLH(req.query)
    res.json(data)
  })
)

route.get(
  '/proxy/sulteng/data-rtlh',
  AsyncHandler(async function handler(req, res) {
    const data = await ExApiService.findDataRTLHSulteng(req.query)
    res.json(data)
  })
)

route.get(
  '/proxy/e-rtlh/data-rtlh',
  AsyncHandler(async function handler(req, res) {
    const data = await ExApiService.findERTLH(req.query)
    res.json(data)
  })
)

export default route
