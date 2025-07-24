function isNullOrEmpty(data, checkWhiteSpace = false) {
  return (
    data === undefined ||
    data === null ||
    data === '' ||
    (!checkWhiteSpace && data === 'null') ||
    (checkWhiteSpace && isOnlyWhiteSpace(data))
  );
}

function isOnlyWhiteSpace(data) {
  return data.toString().replace(/ /g, '') === '';
}

function generateAlphaNumeric(lengthPw = 10) {
  var text = '';
  var possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < lengthPw; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

function isEqualAsEmpty(data) {
  return (
    data === '' ||
    data === 'null' ||
    data === 'undefined' ||
    data === 'Invalid Date'
  );
}

module.exports = {
  isNullOrEmpty,
  generateAlphaNumeric,
  isEqualAsEmpty,
};
