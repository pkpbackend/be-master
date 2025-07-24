import { defaultAllowedExt } from '../constants/ConstExtension'
import { defaultAllowedMimetype } from '../constants/ConstMimetype'
import { createDirNotExist } from '../helpers/File'
import ResponseError from '../modules/Error'
import multer from 'multer'
import slugify from 'slugify'

const defaultFieldSize = 100 * 1024 * 1024 // 100mb
const defaultFileSize = 100 * 1024 * 1024 // 100mb
const defaultDestination = process.env.DEFAULT_UPLOAD_PATH ?? 'public/uploads/'

/**
 * Hook for creating Multer middleware
 * @param {Object} props Multer Hook Properties
 * @param {string | undefined} props.dest
 * @param {string[] | undefined} props.allowedExt
 * @param {string[] | undefined} props.allowedMimetype
 * @param {Object} props.limit
 * @param {number | undefined} props.limit.fieldSize
 * @param {number | undefined} props.limit.fileSize
 * @returns {multer.Multer}
 */
const useMulter = (props) => {
  // always check destination
  const destination = props?.dest ?? defaultDestination
  createDirNotExist(destination)

  // config storage
  const storage = multer.diskStorage({
    destination,
    filename(req, file, cb) {
      const slugFilename = slugify(file.originalname, {
        replacement: '_',
        lower: true,
      })
      cb(null, [Date.now(), slugFilename].join('-'))
    },
  })

  // config multer upload
  const configMulter = multer({
    storage,
    fileFilter(req, file, cb) {
      const allowedMimetype = props?.allowedMimetype ?? defaultAllowedMimetype
      const allowedExt = props?.allowedExt ?? defaultAllowedExt
      const mimetype = file.mimetype.toLowerCase()

      if (!allowedMimetype.includes(mimetype)) {
        const getExtension = allowedExt.join(', ') // .png, .jpg, .pdf
        const message = `Only ${getExtension} ext are allowed, please check your mimetype file`

        return cb(new ResponseError.BadRequest(message))
      }

      cb(null, true)
    },
    limits: props?.limit ?? {
      fieldSize: defaultFieldSize,
      fileSize: defaultFileSize,
    },
  })

  return configMulter
}

export default useMulter
