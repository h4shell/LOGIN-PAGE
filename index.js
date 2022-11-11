const express = require("express");
const session = require("express-session");
require('dotenv').config();

const app = express();
const WebPort = 8080;
const connection = require("./sql")

console.log(process.env.HOST)
//Uso il middlewear SESSION
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true
  })
);

app.use(express.json());

app.set("view-engine", "ejs");

//Utilizzo il middlewear urlencoded per passare gli input grazie alla convenzione req
app.use(express.urlencoded({ extended: false }));

// Static Files
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("login.ejs");
});

app.post("/login", (req, res) => {


  let username = req.body.username;
  let password = req.body.password;

  if (username && password) {
    connection.query(
      "SELECT * FROM users WHERE username = ? AND password = ?",
      [username, password],
      (error, results, fields) => {

        if (error) throw error;
        if (results.length > 0) {
          req.session.loggedin = true;
          req.session.username = username;
          res.redirect("/home");
        } else {
          res.send("Incorrect Username or Password");
          res.end();
        }
      }
    );
  }
});

app.get("/home", function (req, res) {
  // If the user is loggedin
  if (req.session.loggedin) {
    // Output username
    res.render("index.ejs", {
      porta: String(WebPort),
      username: req.session.username
    });
  } else {
    // Not logged in
    res.send("Please login to view this page!");
  }
  res.end();
});

app.listen(WebPort, () => {
  console.log("Server in ascolto sulla porta " + String(WebPort));
});

