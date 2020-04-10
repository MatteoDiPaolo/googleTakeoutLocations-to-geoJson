const fs = require('fs');


const copyFile = (orignFilePath, destinationFilePath) =>
    fs.createReadStream(orignFilePath).pipe(fs.createWriteStream(destinationFilePath));

module.exports = { copyFile }

