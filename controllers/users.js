const express = require("express");
const router = express.Router();
const db = require("../models");
const cryptoJS = require("crypto-js");
const bcrypt = require("bcryptjs");

// GET users/new -- renders a form to create a new user
router.get("/new", (req, res) => {
  res.render("users/new.ejs", { msg: null });
});

// POST /users -- create a new user and redirects to index
router.post("/", async (req, res) => {
  try {
    //try to create the user
    //TODO: hash password
    const hashedPassword = bcrypt.hashSync(req.body.password, 12);
    const [user, created] = await db.user.findOrCreate({
      where: { email: req.body.email },
      defaults: { password: hashedPassword },
    });
    // if the user is new
    if (created) {
      // log them in by giving them a cookie
      // res.cookie('cookie name', cookie data)

      const encryptedId = cryptoJS.AES.encrypt(
        user.id.toString(),
        process.env.ENC_KEY
      ).toString();
      res.cookie("userId", encryptedId);
      // redirect to the homepage (in the future this could redirect elsewhere)
      res.redirect("/users/profile");
    } else {
      // if the user was not created
      //re render the login form with a message for the user
      console.log("that email already exists");
      res.render("users/new.ejs", { msg: "email exists in database already" });
    }
  } catch (err) {
    next(err);
  }
});

// GET /users/login -- renders a login form
router.get("/login", (req, res) => {
  res.render("users/login.ejs", { msg: null });
});
// POST /users/login -- authenticates user credentials against the DB
router.post("/login", async (req, res) => {
  try {
    // look up the user in the db based on their email
    const foundUser = await db.user.findOne({
      where: { email: req.body.email },
    });
    const msg = "bad login credentials, you are not authenticated";
    // if the user is not found -- display the login form and give them a message
    if (!foundUser) {
      console.log("email not found on login");
      res.render("users/login.ejs", { msg });
      return; //do not continue with the function
    }
    // otherwise, check the provided password against the password in the db
    // has the password from the req.body and compare it to the db password
    const compare = bcrypt.compareSync(req.body.password, foundUser.password);
    if (compare) {
      // if they match -- send the user a cookie to log them in
      const encryptedId = cryptoJS.AES.encrypt(
        foundUser.id.toString(),
        process.env.ENC_KEY
      ).toString();
      res.cookie("userId", encryptedId);

      res.redirect("/users/profile");
    } else {
      res.render("users/login.ejs", { msg });
    }

    // if not -- render the login form with a message
  } catch (err) {
    console.log(err);
  }
});
// GET /users/logout -- clear the cookie to log the user out
router.get("/logout", (req, res) => {
  // clear the cookie from storage
  res.clearCookie("userId");
  // redirect to root
  res.redirect("/");
});

router.get("/profile", (req, res) => {
  //check if user is authorized
  if (!res.locals.user) {
    // if the user is not authorized, ask them to log in
    res.render("users/login.ejs", { msg: "please log in to continue" });
    return; //end the route here
  }

  res.render("users/profile", { user: res.locals.user });
});
module.exports = router;
