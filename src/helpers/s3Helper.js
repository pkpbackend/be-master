import fs from "fs"
import { Upload } from "@aws-sdk/lib-storage"
import { S3Client, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

import {
  APP_ENV,
  BASE_URL,
  S3_ACCESS_KEY,
  S3_SECRET_KEY,
  S3_ENDPOINT,
  S3_BUCKET_NAME,
  S3_REGION,
  S3_DIRECT_URL,
} from "../config/env"

const mkS3Client = () => {

  let params = {
    credentials: {
      accessKeyId: S3_ACCESS_KEY,
      secretAccessKey: S3_SECRET_KEY,
    },
    region: S3_REGION || "",
  }

  if (S3_ENDPOINT) {
    params = {
      ...params,
      endpoint: S3_ENDPOINT,
    }
  }
  
  return new S3Client(params)
}

const completingS3Key = (s3key) => {
  return s3key.substr(0, APP_ENV.length) === APP_ENV
    ? s3key
    : `${APP_ENV}/${s3key}`
}

export const uploadFileToS3 = async (
  fileSource,
  s3key,
  returnPresignedUrl = false
) => {
  const s3Client = mkS3Client()
  const newS3key = completingS3Key(s3key)

  return new Promise((resolve, reject) => {
    const fileData = fs.readFileSync(fileSource)

    const params = {
      // ACL: 'public-read',
      Bucket: S3_BUCKET_NAME,
      Key: newS3key,
      Body: fileData,
    }

    new Upload({
      client: s3Client,
      params,
      // queueSize: 4, // optional concurrency configuration
      // partSize: 1024 * 1024 * 5, // optional size of each part, in bytes, at least 5MB
      // leavePartsOnError: false, // optional manually handle dropped parts
    })
      .done()
      .then((data) => {
        if (S3_DIRECT_URL === 'no') {
          return resolve(`${BASE_URL}/file/${s3key}`)
        }

        if (!returnPresignedUrl) {
          resolve(`${BASE_URL}/file/${s3key}`)
        } else {
          const presignedUrlParams = {
            Bucket: S3_BUCKET_NAME,
            Key: newS3key,
          }

          const command = new GetObjectCommand(presignedUrlParams)
          getSignedUrl(s3Client, command, {
            expiresIn: 3600,
          })
            .then((url) => resolve(url))
            .catch((err) => reject(err))
        }
      })
      .catch((err) => {
        console.log("err")
        console.log(err)
        reject(err)
      })
  })
}

export const getS3File = async (s3key) => {
  const s3Client = mkS3Client()

  const newS3key = completingS3Key(s3key)
  const params = {
    Bucket: S3_BUCKET_NAME,
    Key: newS3key,
  }

  return new Promise((resolve, reject) => {
    const command = new GetObjectCommand(params)
    getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    })
      .then((url) => resolve(url))
      .catch((err) => reject(err))
  })
}

export const removeS3File = async (s3key) => {
  const s3Client = mkS3Client()

  const newS3key = completingS3Key(s3key)
  const params = {
    Bucket: S3_BUCKET_NAME,
    Key: newS3key,
  }

  return new Promise((resolve, reject) => {
    s3Client
      .send(new DeleteObjectCommand(params))
      .then((url) => resolve(url))
      .catch((err) => reject(err))
  })
}
