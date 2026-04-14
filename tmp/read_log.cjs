const fs = require('fs');
const content = fs.readFileSync('build_error.log', 'utf16le');
console.log(content);
