const { exec } = require("child_process");


const asyncExec = command => new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
        if (error) reject(error)
        resolve(stdout ? stdout : stderr);
    });
})

module.exports = { asyncExec }