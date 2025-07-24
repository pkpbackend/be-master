import express from 'express'
import AsyncHandler from '../../helpers/AsyncHandler'
import HelpdeskService from './service'
import OptMiddleware from '../../middlewares/OptMiddleware'
import AuthMiddleware from '../../middlewares/AuthMiddleware'

const route = express.Router()

route.get(
  '/',
  AsyncHandler(async function handler(req, res) {
    const data = await HelpdeskService.findAll(req)
    res.json(data)
  })
)

route.get(
  '/chats',
  AsyncHandler(async function handler(req, res) {
    const data = await HelpdeskService.findAllChat(req)
    res.json(data)
  })
)

route.post(
  '/:helpdeskId/chat',
  OptMiddleware,
  AsyncHandler(async function handler(req, res) {
    const { helpdeskId } = req.params

    req.body.HelpdeskId = helpdeskId
    const data = await HelpdeskService.createChat(req, res)
    res.json(data)
  })
)

route.get(
  '/topik-diskusi',
  AsyncHandler(async function handler(req, res) {
    const data = await HelpdeskService.getTopdis(req)
    res.json(data)
  })
)

route.get(
  '/check-my-acc',
  AuthMiddleware,
  AsyncHandler(async function handler(req, res) {
    const data = await HelpdeskService.getMyProfile(req, res)
    res.json(data)
  })
)

route.get(
  '/:id',
  AsyncHandler(async function handler(req, res) {
    const data = await HelpdeskService.findOne(req)
    res.json(data)
  })
)

route.put(
  '/:id',
  OptMiddleware,
  AsyncHandler(async function handler(req, res) {
    const data = await HelpdeskService.update(req, res)
    res.json(data)
  })
)

route.post(
  '/',
  OptMiddleware,
  AsyncHandler(async function handler(req, res) {
    const data = await HelpdeskService.create(req, res)
    res.json(data)
  })
)

route.post(
  '/reset-topdis',
  AsyncHandler(async function handler(req, res) {
    const data = await HelpdeskService.resetTopdis(req)
    res.json(data)
  })
)

export default route
