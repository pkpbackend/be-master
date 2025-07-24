class BaseErrorResponse extends Error {
  status

  constructor(message, status = 500) {
    super(message)
    this.message = message
    this.status = status
    Object.setPrototypeOf(this, BaseErrorResponse.prototype)
  }
}

export default BaseErrorResponse
