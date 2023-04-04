require('dotenv').config();
const express = require('express')
const port = 3000
const bodyParser = require("body-Parser");
const mongoose = require("mongoose");
const app = express();
let quo="“Success is no accident. It is hard work, perseverance, learning, studying, sacrifice and most of all, love of what you are doing or learning to do.” ―Pele";
const LocalStrategy = require('passport-local');
const Schema = mongoose.Schema;
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');
const axios = require("axios");

// const mus = {
//   method: 'GET',
//   url: 'https://spotify23.p.rapidapi.com/search/',
//   params: {q: 'aniruth', type: 'multi', offset: '0', limit: '10', numberOfTopResults: '5'},
//   headers: {
//     'X-RapidAPI-Key': 'a629748f3emsh2a3b2f8c7b54248p1e83bbjsn75b2b0e79fa2',
//     'X-RapidAPI-Host': 'spotify23.p.rapidapi.com'
//   }
// };
//
// axios.request(mus).then(function (response) {
// 	console.log(response.data);
// }).catch(function (error) {
// 	console.error(error);
// });





const options = {
  method: 'GET',
  url: 'https://quotes15.p.rapidapi.com/quotes/random/',
  headers: {
    'X-RapidAPI-Key': 'a629748f3emsh2a3b2f8c7b54248p1e83bbjsn75b2b0e79fa2',
    'X-RapidAPI-Host': 'quotes15.p.rapidapi.com'
  }
};




app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,

}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb+srv://itsakshayv:test123@cluster0.qsg89dz.mongodb.net/userDB", {
  useNewUrlParser: true
});

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  googleId: String,
  secret: String,
  username: String,
  gender: String,
  age: Number

});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);


const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());


passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/dash",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile);

    User.findOrCreate({
      googleId: profile.id
    }, function(err, user) {
      return cb(err, user);
    });
  }
));




const cono = mongoose.createConnection("mongodb+srv://itsakshayv:test123@cluster0.qsg89dz.mongodb.net/miniDB", {
  useNewUrlParser: true
});







const miniSchema = {
  title: String,
  content: String
};
const Post = cono.model("Post", miniSchema);
app.use(express.static("public"));
app.use(bodyParser.urlencoded({
  extended: true
}));

app.set('view engine', 'ejs');
var titles = ["aaaa", "kkkkk"];
var contents = ["aaaa", "kkkkk"];


app.get("/login", function(res, res) {
  res.render("login");
});

app.get("/adminpage", function(res, res) {
  res.render("admin");
});
app.get("/register", function(res, res) {
  res.render("register");
});
app.get("/write", function(req, res) {
  if (req.isAuthenticated()) {
    res.render("write");
  } else {
    res.redirect("/login");
  }

});
app.get("/", function(res, res) {
  res.render("home");
});

app.get("/auth/google",
  passport.authenticate('google', {
    scope: ["profile"]
  })
);
app.get("/auth/google/dash",
  passport.authenticate('google', {
    failureRedirect: "/login"
  }),
  function(req, res) {
    // Successful authentication, redirect to secrets.
    res.redirect("/dash");
  });



app.post("/register", function(req, res) {
  User.register({
    username: req.body.username
  }, req.body.password, function(err, user) {
    if (err) {
      console.log(err);
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, function() {
        res.redirect("/dash");
      });
    }
  });

});


app.post("/login", function(req, res) {
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, function(err) {
    if (err) {
      res.redirect("/login");
    } else {
      passport.authenticate("local")(req, res, function() {
        res.redirect("/dash");
      });
    }
  });

});



app.get('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
});





app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("css"));


app.get("/dash", function(req, res) {
  if (req.isAuthenticated()) {
    axios.request(options).then(function (response) {
   quo = response.data.content;
      console.log(quo);

    }).catch(function (error) {
    	console.error(error);
    });
    Post.find().then(function(lists) {
      res.render("dash", {
        titlel: lists,
        content: lists,
        quote:quo,
      });
    });
  } else {
    res.redirect("/login");
  }
});




// app.get("/adminpage", function(req, res) {
//   if (req.isAuthenticated()) {
//     Post.find().then(function(lists) {
//       res.render("admin", {
//         titlel: lists,
//         content: lists
//       });
//     });
//   } else {
//     res.redirect("/login");
//   }
// });




app.post("/write", function(req, res) {
  var title = req.body.title;
  var con = req.body.story;
  console.log(title);
  console.log(con);
  const li = new Post({
    title: title,
    content: con,
  });
  const defaultPost = [li];
  Post.insertMany(defaultPost)
    .then(function() {
      console.log("Saved");
    })
    .catch(function(err) {
      console.log(err);
    });

  res.redirect("/dash")

});
app.post("/del", function(req, res) {
  const delid = req.body.del;
  Post.findByIdAndDelete(delid)
    .then(function() {
      console.log("Deleted");
      res.redirect("/dash")
    })
    .catch(function(err) {
      console.log(err);
    });


});
app.listen(port, function() {
  console.log("started");
});
