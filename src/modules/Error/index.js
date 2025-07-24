import BadRequest from './BadRequest'
import BaseResponseError from './BaseResponseError'
import Forbidden from './Forbidden'
import InternalServer from './InternalServer'
import NotFound from './NotFound'
import Unauthorized from './Unauthorized'

const ResponseError = {
  BadRequest,
  BaseResponseError,
  Forbidden,
  InternalServer,
  NotFound,
  Unauthorized,
}

export default ResponseError
