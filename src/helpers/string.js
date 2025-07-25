const uuidValidate = (value) => {
  // bikin validasi uuid menggunakan regex
  const regex = new RegExp(
    `^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$`,
    'i'
  )

  return regex.test(value)
}

export default {
  uuidValidate,
}
