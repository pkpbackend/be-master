import jwt from 'jsonwebtoken'
import { JWT_SECRET_ACCESS_TOKEN } from '../config/env'

export default async function OptMiddleware(req, res, next) {
  const accessTokenInternal = req.headers.authorization
    ? req.headers.authorization.substr(7)
    : req.cookies.accessTokenInternal

  if (accessTokenInternal) {
    try {
      const decoded = await jwt.verify(
        accessTokenInternal,
        JWT_SECRET_ACCESS_TOKEN
      )

      res.locals.accessTokenInternal = accessTokenInternal
      res.locals.profile = decoded.user
    } catch (error) {
      // console.log(error)
      // return res.status(403).json({ message: 'Access denied' })
    }
  }

  next()
}
