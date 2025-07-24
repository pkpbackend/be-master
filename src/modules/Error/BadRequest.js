import BaseResponseError from './BaseResponseError'

class BadRequest extends BaseResponseError {
  constructor(message) {
    super(message, 400)
    Object.setPrototypeOf(this, BadRequest.prototype)
  }
}

export default BadRequest
