const crypto = require('crypto');
const fs = require('fs');

function genKeyPair() {
    const keyPair = crypto.generateKeyPairSync('rsa', {
        modulusLength: 4096, // bits - standard for RSA keys
        publicKeyEncoding: {
            type: 'pkcs1', // "Public Key Cryptography Standards 1" 
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs1',
            format: 'pem'
        }
    });

    // Public key
    fs.writeFileSync(__dirname + '/../keys/id_rsa_pub.pem', keyPair.publicKey); 
    
    // Private key
    fs.writeFileSync(__dirname + '/../keys/id_rsa_priv.pem', keyPair.privateKey);
}
genKeyPair();
