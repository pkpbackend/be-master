class TransformHelper {
  value

  constructor(initialValue) {
    this.setValue(initialValue)
  }

  setValue(value) {
    this.value = value
  }

  getValue() {
    return this.value
  }
}

export default TransformHelper
