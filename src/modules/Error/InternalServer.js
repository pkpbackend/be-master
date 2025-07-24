import BaseResponseError from './BaseResponseError'

class InternalServer extends BaseResponseError {
  constructor(message) {
    super(message, 500)
    Object.setPrototypeOf(this, InternalServer.prototype)
  }
}

export default InternalServer
