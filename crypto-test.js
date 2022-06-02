// // const bcrypt = require("bcryptjs");
// // const cryptoJS = require("crypto-js");

// // const testBcrypt = () => {
// //   const password = "hello_1234";
// //   // turn this password string into a hash
// //   // when a user signs up, we will hash their possword and store it in our db
// //   const salt = 12;
// //   const hash = bcrypt.hashSync(password, salt);
// //   console.log(hash);

// //   // so when a user logs in we can use compare sync to match passwords to our db's hashes

// //   const compare = bcrypt.compareSync(password, hash);
// //   console.log("do they match?", compare);
// // };

// // // testBcrypt();

// // const testCrypto = () => {
// //   // this pass phrase will be known only to the server admins
// //   const passPhrase = "1234_hello";
// //   // thiss message will be in the cookie as the user's id
// //   const message = "hi i am encrypted";

// //   const encrypted = cryptoJS.AES.encrypt(message, passPhrase).toString();
// //   //   console.log(encrypted);
// //   // in the middle we will decrypt
// //   const decrypted = cryptoJS.AES.decrypt(encrypted, passPhrase).toString(
// //     cryptoJS.enc.Utf8
// //   );
// //   console.log(decrypted);
// // };

// // testCrypto();

// // db_name();

// const express = require("express");
// const router = express.Router();
// const db = require("./models");
// const cryptoJS = require("crypto-js");
// const bcrypt = require("bcryptjs");

// router.post("/", async (req, res) => {
//   try {
//     //try to create the user
//     //TODO: hash password
//     // const hashedPassword = bcrypt.hashSync(req.body.password, 12);
//     const [user, created] = await db.user.findOrCreate({
//       where: { email: "asdf@123" },
//       defaults: { password: "1234" },
//     });
//     // if the user is new
//     if (created) {
//       // log them in by giving them a cookie
//       // res.cookie('cookie name', cookie data)

//       const encryptedId = cryptoJS.AES.encrypt(
//         user.id.toString(),
//         process.env.ENC_KEY
//       ).toString();
//       res.cookie("userId", encryptedId);
//       // redirect to the homepage (in the future this could redirect elsewhere)
//       res.redirect("/users/profile");
//     } else {
//       // if the user was not created
//       //re render the login form with a message for the user
//       console.log("that email already exists");
//       res.render("users/new.ejs", { msg: "email exists in database already" });
//     }
//   } catch (err) {
//     next(err);
//   }
// });
