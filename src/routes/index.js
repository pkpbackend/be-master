import Express from 'express'
import Response from '../modules/Response'
import AsyncHandler from '../helpers/AsyncHandler'
import { BASE_URL_SERVER } from '../config/baseURL'
import { NODE_ENV } from '../config/env'
import ExApiController from '../controllers/ExApi/controller'

const route = Express.Router()

// Index Route
route.get(
  '/',
  AsyncHandler(function (req, res) {
    let responseData = {
      service: 'Master',
      message: 'Sibaru API v3',
      maintaner: '@SibaruDJP',
    }

    if (NODE_ENV !== 'production') {
      responseData = {
        ...responseData,
        docs: `${BASE_URL_SERVER}/v1/api-docs`,
      }
    }

    // #swagger.responses[200] = { description: 'Ok' }
    const httpResponse = Response.Ok.get(responseData)
    return res.json(httpResponse)
  })
)

// Forbidden Api
route.get('/v1', function (req, res) {
  // #swagger.responses[403] = { description: 'Forbidden, wrong access endpoint' }
  throw new Response.Error.Forbidden(
    `Forbidden, wrong access endpoint: ${req.url}`
  )
})

route.use('/exapi', ExApiController)

export default route
