const crypto = require('crypto');

// Generate a 32-byte (256-bit) random key and encode it as a hexadecimal string
const refreshSecret = crypto.randomBytes(32).toString('hex');

console.log('Your JWT Refresh Secret:', refreshSecret);
