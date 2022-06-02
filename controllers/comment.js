const express = require("express");
const router = express.Router();
const db = require("../models");
const cryptoJS = require("crypto-js");
const bcrypt = require("bcryptjs");

router.post("/add", async (req, res) => {
  //check if user is authorized
  if (!res.locals.user) {
    // if the user is not authorized, ask them to log in
    res.render("users/login.ejs", { msg: "please log in to continue" });
    return; //end the route here
  }
  // console.log(res.locals.user);
  // const user = await db.user.findOne({
  //   where: {
  //     id: res.locals.user.id,
  //   },
  // });
  //   await db.comment.create({
  //     content: req.body.comment,
  //   });
  await res.locals.user.createComment({
    content: req.body.comment,
    musicId: res.locals.user.id,
  });

  //find all comments on that users page
  // need to be able to show the commenters id?
  // let comments = await res.locals.user.getComment();
  // console.log(comments);

  res.redirect(`/users/profile`);
});
router.delete("/delete", async (req, res) => {});

module.exports = router;

// old comment form add?
// <form action="/users/<%= params %>/profile" method="POST">
