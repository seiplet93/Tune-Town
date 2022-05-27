const bcrypt = require("bcryptjs");
const cryptoJS = require("crypto-js");

const testBcrypt = () => {
  const password = "hello_1234";
  // turn this password string into a hash
  // when a user signs up, we will hash their possword and store it in our db
  const salt = 12;
  const hash = bcrypt.hashSync(password, salt);
  console.log(hash);

  // so when a user logs in we can use compare sync to match passwords to our db's hashes

  const compare = bcrypt.compareSync(password, hash);
  console.log("do they match?", compare);
};

// testBcrypt();

const testCrypto = () => {
  // this pass phrase will be known only to the server admins
  const passPhrase = "1234_hello";
  // thiss message will be in the cookie as the user's id
  const message = "hi i am encrypted";

  const encrypted = cryptoJS.AES.encrypt(message, passPhrase).toString();
  //   console.log(encrypted);
  // in the middle we will decrypt
  const decrypted = cryptoJS.AES.decrypt(encrypted, passPhrase).toString(
    cryptoJS.enc.Utf8
  );
  console.log(decrypted);
};

testCrypto();
