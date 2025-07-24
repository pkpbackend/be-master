import BaseResponseError from './BaseResponseError'

class Unauthorized extends BaseResponseError {
  constructor(message) {
    super(message, 401)
    Object.setPrototypeOf(this, Unauthorized.prototype)
  }
}

export default Unauthorized
