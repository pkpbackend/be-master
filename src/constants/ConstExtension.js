// // Dokumen
// 'pdf',
// 'doc',
// 'docx',
// // Foto
// 'jpg',
// 'jpeg',
// 'gif',
// 'png',
// 'bmp',
// 'ico',
// 'svg',
// 'svgz',
// 'tif',
// 'tiff',
// 'ai',
// 'drw',
// 'pct',
// 'psp',
// 'xcf',
// 'psd',
// 'raw',
// 'webp',
// // Video
// 'mp4',
// 'mp4a',
// 'mp4b',
// 'webm',

// extension
export const allowedZIP = ['.zip', '.7z']
export const allowedPDF = ['.pdf']
export const allowedImage = ['.png', '.jpg', '.jpeg', '.svg', '.webp']
export const allowedExcel = ['.xlsx', '.xls']
export const allowedDoc = ['.doc', '.docx']
export const allowedVideo = ['.mp4', '.mp4a', '.mp4b', '.webm']

// default allowed ext
export const defaultAllowedExt = [
  ...allowedZIP,
  ...allowedPDF,
  ...allowedImage,
  ...allowedExcel,
  ...allowedDoc,
  ...allowedVideo,
]
