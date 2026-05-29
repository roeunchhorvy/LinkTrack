// Generates a URL-friendly short code using nanoid.
// We use a custom alphabet (no ambiguous chars like 0/O, 1/l/I) and length 7.
const { customAlphabet } = require('nanoid');

const alphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const nanoid = customAlphabet(alphabet, 7);

function generateShortCode() {
  return nanoid();
}

module.exports = generateShortCode;
