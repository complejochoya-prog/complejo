const fs = require('fs');
const content = fs.readFileSync('build_error.txt', 'utf16le');
console.log(content);
