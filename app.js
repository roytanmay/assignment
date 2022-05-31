require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(
  "mongodb+srv://internshala-assignment:assignment@cluster0.mx83yf8.mongodb.net/?retryWrites=true&w=majority"
);

const userSchema = new mongoose.Schema({
  name: String,
  username: String,
  password: String,
  bio: String,
});

userSchema.plugin(encrypt, {
  secret: process.env.SECRET,
  encryptedFields: ["password"],
});

const User = mongoose.model("User", userSchema);
let users = [];

app.get("/", function (req, res) {
  res.render("home");
});

app.get("/login", function (req, res) {
  res.render("login");
});

app.get("/signup", function (req, res) {
  res.render("signup");
});

app.post("/signup", function (req, res) {
  const newUser = new User({
    name: req.body.name,
    username: req.body.username,
    password: req.body.password,
    bio: req.body.bio,
  });

  User.findOne({ username: req.body.username }, function (err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        res.send("Already signed up");
      } else {
        newUser.save(function (err) {
          if (err) {
            console.log(err);
          } else {
            users.push(newUser);
            User.find(
              { username: { $ne: req.body.username } },
              function (err, foundUsers) {
                if (err) {
                  console.log(err);
                } else {
                  res.render("user", {
                    user: newUser,
                    users: foundUsers,
                  });
                }
              }
            );
          }
        });
      }
    }
  });
});

app.post("/login", function (req, res) {
  const username = req.body.username;
  const password = req.body.password;

  User.findOne({ username: username }, function (err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        if (foundUser.password === password) {
          User.find(
            { username: { $ne: req.body.username } },
            function (err, foundUsers) {
              if (err) {
                console.log(err);
              } else {
                res.render("user", {
                  user: foundUser,
                  users: foundUsers,
                });
              }
            }
          );
        }
      }
    }
  });
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
