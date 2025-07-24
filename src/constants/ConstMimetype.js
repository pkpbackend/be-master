// mimetype
export const allowedMimetypeZIP = [
  'application/zip',
  'application/x-zip-compressed',
  'application/x-7z-compressed',
]
export const allowedMimetypePDF = ['application/pdf']
export const allowedMimetypeImage = ['image/jpeg', 'image/png', 'image/svg+xml']
export const allowedMimetypeExcel = [
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]
export const allowedMimetypeDoc = [
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]
export const allowedMimetypeVideo = [
  'video/mp4',
  'video/mp4a',
  'video/mp4b',
  'video/webm',
]
// default mimetype
export const defaultAllowedMimetype = [
  ...allowedMimetypeZIP,
  ...allowedMimetypePDF,
  ...allowedMimetypeImage,
  ...allowedMimetypeExcel,
  ...allowedMimetypeDoc,
  ...allowedMimetypeVideo,
]
