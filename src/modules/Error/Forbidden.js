import BaseResponseError from './BaseResponseError'

class Forbidden extends BaseResponseError {
  constructor(message) {
    super(message, 403)
    Object.setPrototypeOf(this, Forbidden.prototype)
  }
}

export default Forbidden
