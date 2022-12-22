require('dotenv').config();
const express = require("express");
const jsdom = require("jsdom");
const JSDOM = jsdom.JSDOM;

const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');

const app = express();


app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(session({
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb+srv://rajat4661:Rajat1598@cluster0.ncboalk.mongodb.net/secretslocalhost", {useNewUrlParser: true , useUnifiedTopology:true});


const userSchema = new mongoose.Schema ({
  email: String,
  password: String,
  googleId: String,
  secret: String
});

const facultySchema = new mongoose.Schema ({
   first: String,
   last:String,
   email:String

});

const studentSchema = new mongoose.Schema ({
  first: String,
   last:String,
   email:String
});

const industrypersonSchema = new mongoose.Schema ({
  first: String,
   last:String,
   email:String

});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);
// studentSchema.plugin(passportLocalMongoose);
// studentSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);
const Faculty = new mongoose.model("Faculty", facultySchema);
const Student = new mongoose.model("Student", studentSchema);
const Industryperson = new mongoose.model("Industryperson", industrypersonSchema);



passport.use(User.createStrategy());
// passport.use(Student.createStrategy());


passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile);

    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));


app.get("/", function(req, res){
    res.render("main");
  });

app.get("/auth/google",
  passport.authenticate('google', { scope: ["profile"] })
);

app.get("/auth/google/secrets",
  passport.authenticate('google', { failureRedirect: "/login" }),
  function(req, res) {
    // Successful authentication, redirect to secrets.
    res.redirect("/secrets");
  });


  app.get("/login", function(req, res){
    res.render("main");
  });


  app.get("/register", function(req, res){
    res.render("main");
  });

  app.get("/secrets", function(req, res){
    User.find({"secret": {$ne: null}}, function(err, foundUsers){
      if (err){
        console.log(err);
      } else {
        if (foundUsers) {
          res.render("secrets", {usersWithSecrets: foundUsers});
        }
      }
    });
    // res.render("secrets")
  });

  app.get("/submit", function(req, res){
    if (req.isAuthenticated()){
      res.render("submit");
    } else {
      res.redirect("/login");
    }
  });


 app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/");
  });

  app.post("/submit", function(req, res){
    const submittedSecret = req.body.secret;
  
  //Once the user is authenticated and their session gets saved, their user details are saved to req.user.
    // console.log(req.user.id);
  
    User.findById(req.user.id, function(err, foundUser){
      if (err) {
        console.log(err);
      } else {
        if (foundUser) {
          foundUser.secret = submittedSecret;
          foundUser.save(function(){
            res.redirect("/secrets");
          });
        }
      }
    });
  });
  
 
  app.post("/register", function(req, res){

    User.register({username: req.body.username}, req.body.password, function(err, user){
      if (err) {
        console.log(err);
        res.redirect("/register");
      } else {
        passport.authenticate("local")(req, res, function(){
          res.redirect("/secrets");
        });
      }
    });
  
  });
  
  app.post("/login", function(req, res){
  
    const user = new User({
      username: req.body.username,
      password: req.body.password
    });
  
    req.login(user, function(err){
      if (err) {
        console.log(err);
      } else {
        passport.authenticate("local")(req, res, function(){
          res.redirect("/secrets");
        });
      }
    });
  
  });
  
  app.post("/student" , function(req, res){
    const student  = new Student({
      first :req.body.first,
      last:req.body.last,
      email:req.body.email

    })
     student.save(function(err){
      if(err){
        console.log("bhai kuch galat hora");
      }
      else{
        res.send("submitted ")
      }

     });

  })

  app.post("/faculty" , function(req, res){
    const faculty  = new Faculty({
      first :req.body.first,
      last:req.body.last,
      email:req.body.email

    })
     faculty.save(function(err){
      if(err){
        console.log("bhai kuch galat hora");
      }
      else{
        res.send("submitted ")
      }

     });

  })

  app.post("/industryperson" , function(req, res){
    const industryperson  = new Industryperson({
      first :req.body.first,
      last:req.body.last,
      email:req.body.email

    })
     industryperson.save(function(err){
      if(err){
        console.log("bhai kuch galat hora");
      }
      else{
        res.send("submitted ")
      }

     });

  })
  

  
  

app.listen(3000, function() {
    console.log("Server started on port 3000.");
  });
  
  