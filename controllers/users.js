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

router.get("/profile", async (req, res) => {
  //check if user is authorized
  console.log(res.locals.user.id, "HELLO");
  if (!res.locals.user) {
    // if the user is not authorized, ask them to log in
    res.render("users/login.ejs", { msg: "please log in to continue" });
    return; //end the route here
  }
  const user = await db.user.findOne({
    where: {
      id: res.locals.user.id,
    },
  });
  const allMusic = await db.music.findAll({
    where: {
      userId: user.id,
    },
  });
  const params = req.params.id;

  // show comments from other users with an ID of the page's user
  // show the commenters user id
  const allComments = await db.comment.findAll({
    where: {
      musicId: res.locals.user.id,
    },
  });

  // let loggedInUsersTunes = await res.locals.user.getMusic();

  res.render("users/profile", {
    user: res.locals.user,
    allMusic,
    params,
    allComments,
  });
});

router.get("/:id/profile", async (req, res) => {
  //check if user is authorized
  // console.log(res.locals.user, "HELLO");
  if (!res.locals.user) {
    // if the user is not authorized, ask them to log in
    res.render("users/login.ejs", { msg: "please log in to continue" });
    return; //end the route here
  }
  console.log(req.params);
  const user = await db.user.findOne({
    where: {
      id: res.locals.user.id,
    },
  });
  const allMusic = await db.music.findAll({
    where: {
      userId: req.params.id,
    },
  });

  // show comments from other users with an ID of the page's user
  // show the commenters user id
  const allComments = await db.comment.findAll({
    where: {
      musicId: req.params.id,
    },
  });
  const params = req.params.id;
  // console.log(allComments);
  // let loggedInUsersTunes = await res.locals.user.getMusic();

  res.render("users/profile", {
    user: res.locals.user,
    allMusic,
    allComments,
    params,
  });
});
router.get("/changepw", async (req, res) => {
  res.render("users/changepw.ejs", { msg: "" });
});
router.put("/changepw", async (req, res) => {
  console.log(res.locals.user, "YOOOOOOO");
  try {
    // look up the user in the db based on their email
    const foundUser = res.locals.user;
    const newPw = req.body.newpassword;
    //    where: { email: req.body.email },
    //  });
    //  const msg = "bad login credentials, you are not authenticated";
    //  // if the user is not found -- display the login form and give them a message
    //  if (!foundUser) {
    //    console.log("email not found on login");
    //    res.render("users/login.ejs", { msg });
    //    return; //do not continue with the function
    //  }
    // otherwise, check the provided password against the password in the db
    // has the password from the req.body and compare it to the db password

    const compare = bcrypt.compareSync(req.body.oldpw, foundUser.password);
    if (compare) {
      console.log("its working?");
      const hashedPassword = bcrypt.hashSync(req.body.newpassword, 12);
      foundUser.password = hashedPassword;
      // await foundUser.update({
      //   password: newPw,
      // });
      await foundUser.save();
      // if they match -- send the user a cookie to log them in
      // const encryptedId = cryptoJS.AES.encrypt(
      //   foundUser.id.toString(),
      //   process.env.ENC_KEY
      //.toString();
      // res.cookie("userId", encryptedId);
      // res.redirect("/users/profile");
      // foundUser.password = newPw;
    } else {
      res.render("users/login.ejs", { msg: "Not a matching PW" });
    }
  } catch (err) {
    console.log(err);
  }
  res.render("users/changepw.ejs", { msg: "pw changed" });
});

// router.post("/:id/profile", async (req, res) => {
//   //check if user is authorized
//   if (!res.locals.user) {
//     // if the user is not authorized, ask them to log in
//     res.render("users/login.ejs", { msg: "please log in to continue" });
//     return; //end the route here
//   }
//   // console.log(res.locals.user);
//   // const user = await db.user.findOne({
//   //   where: {
//   //     id: res.locals.user.id,
//   //   },
//   // });
//   // await db.comment.create({
//   //   content: req.body.comment,
//   //
//   // });
//   await res.locals.user.createComment({
//     content: req.body.comment,
//     musicId: req.params.id,
//   });
//   await db.music.create({
//     artist: req.body.name,
//     userId: res.locals.user.id,
//   });
//find all comments on that users page
// need to be able to show the commenters id?
// let comments = await res.locals.user.getComment();
// console.log(comments);

//   res.redirect(`/users/${req.params.id}/profile`);
// });

router.post("/profile", async (req, res) => {
  if (!res.locals.user) {
    // if the user is not authorized, ask them to log in
    res.render("users/login.ejs", { msg: "please log in to continue" });
    return; //end the route here
  }
  console.log(req.body);

  // await db.music.create({
  //   artist: req.body.name,
  //   userId: res.locals.user.id,
  // });

  // await res.locals.user.createComment({
  //   content: req.body.comment,
  //   musicId: res.locals.user.id,
  // });

  res.redirect("/users/profile");
});
router.delete("/profile", async (req, res) => {
  await db.comment.delete({});
});
//  //{
//    user: res.locals.user;
//  }
module.exports = router;
