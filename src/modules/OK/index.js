class ResponseOk {
  /**
   * Base Response
   * @param dataResponse
   * @returns
   */
  static baseResponse(dataResponse = {}) {
    const {
      message = 'data has been received!',
      code = 200,
      ...rest
    } = dataResponse
    return {
      code,
      message,
      ...rest,
    }
  }

  /**
   * Response Get or Sucess
   * @param dataResponse
   * @returns
   */
  static get(dataResponse = {}) {
    return this.baseResponse(dataResponse)
  }

  /**
   * Response Created
   * @param dataResponse
   * @returns
   */
  static created(dataResponse = {}) {
    return this.baseResponse({
      code: 201,
      message: 'data has been added!',
      ...dataResponse,
    })
  }

  /**
   * Response Updated
   * @param dataResponse
   * @returns
   */
  static updated(dataResponse = {}) {
    return this.baseResponse({
      message: 'the data has been updated!',
      ...dataResponse,
    })
  }

  /**
   * Response Deleted
   * @param dataResponse
   * @returns
   */
  static deleted(dataResponse = {}) {
    return this.baseResponse({
      message: 'data has been deleted!',
      ...dataResponse,
    })
  }
}

export default ResponseOk
