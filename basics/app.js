const crypto = require('crypto');
const fs = require('fs');

console.log("i am here")

const derivedKey = crypto.pbkdf2Sync("password", "salt", 8900000, 10, "sha512");
console.log(derivedKey.toString("hex"));

crypto.pbkdf2("password", "salt", 100000, 10, "sha512", (err, derivedKey) => {
    if (err) throw err;
    console.log(derivedKey.toString("hex"));
});

fs.readFile("./file.txt", "utf8", (err, data) => {
    if (err) throw err;
    console.log(data);
});