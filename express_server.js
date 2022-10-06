
//Basic web server using the Express.js framework

const express = require("express");
const morgan = require("morgan");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  
  'abcd': {
    id: 'abcd',
    email: 'jim@mail.com',
    password: '1234'
  },
  
  'efgh': {
    id: 'efgh',
    email: 'susan@mail.com',
    password: '5678'
  }
  
};


const getUserByEmail = (email) => {
  for (const id in users) {
    const user = users[id];

    if (user.email === email) {
      // we found our user!!
      return user;
    }
  }
//maybe this should be undefined for future tests???
  return null;
};




function generateRandomString() {

  let random = (Math.random().toString(36).slice(6, 12));

  return random;
}

function generateUniqueId() {
  return Math.random().toString(36).substring(2, 6);
};




app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.json());


app.get("/", (req, res) => {
  res.send("Hello!");
});



app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});



app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});



app.get("/urls", (req, res) => {
  const id = req.cookies.user_id
  const user = users[id]
  const templateVars = { urls: urlDatabase, user };
  res.render("urls_index", templateVars);
});



app.get("/urls/new", (req, res) => {
  const id = req.cookies.user_id
  const user = users[id]
  const templateVars = { user };
  res.render("urls_new", templateVars);
});



app.get("/urls/:id", (req, res) => {
  const id = req.cookies.user_id
  const user = users[id]
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], user };
  res.render("urls_show", templateVars);
});



app.post("/urls", (req, res) => {
  const id = generateRandomString();
  let value = req.body["longURL"];
  urlDatabase[id] = value;
  res.redirect(`/urls/${id}`);
});


//code for redirecting to a url from it's shortend form
app.get("/u/:id", (req, res) => {

  const id = req.params.id;
  const longURL = urlDatabase[id];
  res.redirect(longURL);
});


app.get("/register", (req, res) => {
  
  res.render("urls_register", {user:null});
});


app.get("/login", (req, res) => {

  res.render("urls_login", {user:null})
})


//Code for deleting a saved url
app.post('/urls/:id/delete', (req, res) => {
  const id = req.params.id;

  delete urlDatabase[id];

  res.redirect("/urls");
});


app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = req.body.longURL;
  console.log("id: ", id);
  console.log("longURL: ", longURL);
  urlDatabase[id] = longURL;

  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const email = req.body.email
  const password = req.body.password
  
const dbUser = getUserByEmail(email);
// User not found error check
if (!dbUser) {
  return res.status(403).send('user not found')
}
//incorrect password error check
if (dbUser && dbUser.password !== password) {
  return res.status(403).send('Incorrect password')
}

  res.cookie('user_id', dbUser.id);
  res.redirect("/urls");
});


app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/urls");
});

//code to register a new user in the users database
app.post("/register", (req, res) => {
  const email = req.body.email
  const password = req.body.password
  
  //checks if a email and password are being entered
  if (!email || !password) {
    return res.status(400).send('please enter an email and a password')
  }
  //checks if the email is already being used
  const dbUser = getUserByEmail(email);
  
  if (dbUser) {
    return res.status(400).send('email is already in use')
  }
  //creates a new user object
  const id = generateUniqueId()

const user = {
id,
email,
password
};

//updates the user database with the new user
users[id] = user;
res.cookie('user_id', user.id)
res.redirect("/urls")

});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
