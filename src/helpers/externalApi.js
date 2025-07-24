import axios from 'axios'
import https from 'https'
import { EXAPI_RTLH, EXAPI_RTLH_KEY } from '../config/env'

function mkExapi(baseURL) {
  const externalApi = axios.create({
    baseURL,
  })

  externalApi.interceptors.request.use(
    function (config) {
      // Do something before request is sent

      // if (localStorage.accessToken) {
      //   const token = localStorage.accessToken
      config.headers.api_key = EXAPI_RTLH_KEY

      const agent = new https.Agent({  
        rejectUnauthorized: false
      })
      config.httpsAgent = agent

      //   return config
      // }

      return config
    },
    function (error) {
      // Do something with request error
      return Promise.reject(error)
    }
  )

  externalApi.interceptors.response.use(
    function (response) {
      // Do something with response data
      // response.data = (response.data).data
      return response
    },
    function (error) {
      // Do something with response error
      return Promise.reject(error)
    }
  )

  return externalApi
}

export const mkExapiRTLH = () => mkExapi(EXAPI_RTLH)
