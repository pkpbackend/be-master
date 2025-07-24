import BaseResponseError from './BaseResponseError'

class NotFound extends BaseResponseError {
  constructor(message) {
    super(message, 404)
    Object.setPrototypeOf(this, NotFound.prototype)
  }
}

export default NotFound
