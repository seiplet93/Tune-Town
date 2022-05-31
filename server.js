// required packages
require("dotenv").config();
const express = require("express");
const { use } = require("express/lib/application");
const rowdy = require("rowdy-logger");
const cookieParser = require("cookie-parser");
const db = require("./models");
const cryptoJS = require("crypto-js");
const res = require("express/lib/response");
const axios = require("axios");
// app config
const PORT = process.env.PORT || 3002;
const app = express();
app.set("view engine", "ejs");

// middlewares
const rowdyRes = rowdy.begin(app);
app.use(require("express-ejs-layouts"));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// DIY middleware
// happens on every request
app.use((req, res, next) => {
  // handy dandy debugging request logger
  console.log(
    `[${new Date().toLocaleDateString()}] incoming request: ${req.method} ${
      req.url
    }`
  );
  console.log("request body:", req.body);
  //modify the response to give data to the routes/middleware that is downstream
  res.locals.myData = "hi, i came from a middleware";
  // tell express that the middleware is done
  next();
});

// auth middleware
app.use(async (req, res, next) => {
  try {
    // if there is a cookie,
    if (req.cookies.userId) {
      //try to find that user in the db
      const userId = req.cookies.userId;
      const decryptedId = cryptoJS.AES.decrypt(
        userId,
        process.env.ENC_KEY
      ).toString(cryptoJS.enc.Utf8);
      const user = await db.user.findByPk(decryptedId);
      // mount the found user on the res.locals so that later routes can access the logged in user
      // any value on the res.locals is available to the layout.ejs
      res.locals.user = user;
    } else {
      // the user is explicitly not logged in
      res.locals.user = null;
    }

    // go to the next route/middleware
  } catch (err) {
    console.log(err);
  } finally {
    // happens no matter what
    // go to the next route/middleware
    next();
  }
});

// routes
app.get("/", (req, res) => {
  let loggedInUsersTunes = res.locals.user.getMusic();
  console.log(loggedInUsersTunes);
  res.render("index");
});
app.get("/search", (req, res) => {
  res.render("search.ejs");
});

app.get("/results", (req, res) => {
  //, { music: response });
  axios
    .get(
      `https://www.theaudiodb.com/api/v1/json/2/search.php?s=${req.query.musicSearch}`
    )
    .then((response) => {
      // console.log(response.data.artists);
      res.render("results.ejs", { music: response.data.artists });
    })
    .catch(console.log);
});

// controllers
app.use("/users", require("./controllers/users"));

// 404 error handler -- NEEDS TO GO LAST
// app.get('/*', (req, res) => {
//   //render a 404 template

// })
app.use((req, res, next) => {
  //render a 404 template
  res.status(404).render("404.ejs");
});

// 500 error handler
// needs to have all 4 parameters
app.use((error, req, res, next) => {
  // log the error
  console.log(error);
  // send a 500 error template
  res.status(500).render("500.ejs");
});

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
  rowdyRes.print();
});
