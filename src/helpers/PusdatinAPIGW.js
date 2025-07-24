import axios from 'axios'

class PusdatinAPIGW {
  static email = 'djpr@pu.go.id'

  static password = 'RahasiaAPI2022'

  // Token Sireng
  static token = null

  static async login() {
    try {
      const data = await axios.post('https://apigw.pu.go.id/user/login', {
        email: PusdatinAPIGW.email,
        password: PusdatinAPIGW.password,
        // eslint-disable-next-line camelcase
        remember_me: true,
      })

      const response = data.data

      if (response.session_token) {
        this.token = response.session_token
      } else {
        throw new Error(response.error.message)
      }
    } catch (error) {
      console.log(error)
      return error
    }
  }
}

export default PusdatinAPIGW
