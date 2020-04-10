const fs = require('fs');
const path = require('path')


const emptyDirectory = directoryPath => new Promise((resolve, reject) => {
    fs.readdir(directoryPath, (error, files) => {
        if (error) reject(error);
        for (const file of files) {
            fs.unlink(path.join(directoryPath, file), error => {
                if (error) reject(error);
            });
        }
        resolve();
    });
})

module.exports = { emptyDirectory }