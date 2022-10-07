
//Basic web server using the Express.js framework

const express = require("express");
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');

const { getUserByEmail } = require("./helper");

const PORT = 8080; // default port 8080
const app = express();



const urlDatabase = {
  'b2xVn2': {
    longURL: "http://www.lighthouselabs.ca",
    userID: "aj48lw",
  },
  '9sm5xK': {
    longURL: "http://www.google.com",
    userID: "aj48lw",
  },
};

const users = {

  'abcd': {
    id: 'abcd',
    email: 'jim@mail.com',
    password: 'dsfkjk34jkljsf'
  },

  'efgh': {
    id: 'efgh',
    email: 'susan@mail.com',
    password: 'werjlkqwoifsddf'
  }

};



function generateRandomString() {
  let random = (Math.random().toString(36).slice(6, 12));
  return random;
}

function generateUniqueId() {
  return Math.random().toString(36).substring(2, 6);
};


app.set("view engine", "ejs");


app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.use(cookieSession({
  name: 'session',
  keys: ['dfsdf3dsfsd34']
}));







//Redirects user to Urls main page if they're logged in
//Redirects user to login page if they aren't logged in
app.get("/", (req, res) => {
  const id = req.session.user_id;
  const user = users[id];

  if (!user) {
    return res.redirect("/login");
  }
  return res.redirect("/urls");
});






//Main URL Page
app.get("/urls", (req, res) => {
  const id = req.session.user_id;
  const user = users[id];
  //If user isn't logged in displays error message with redirect links
  if (!user) {
    res.send("<html><body>Error please <a href=/login>log in</a> or <a href=/register>register</a> to view URLs.</body></html>");
    return;
  }
//Displays URLs the user has created
  const urlsForUser = (id) => {
    const result = {};
    for (const shortUrl in urlDatabase) {
      if (id === urlDatabase[shortUrl].userID) {
        result[shortUrl] = urlDatabase[shortUrl];

      }
    }
    return result;
  };

  const templateVars = { urls: urlsForUser(id), user };
  res.render("urls_index", templateVars);
});









// Page for creating new URLs
app.get("/urls/new", (req, res) => {
  const id = req.session.user_id;
  const user = users[id];
  //Checks whether user is logged in before they are allowed to create a new URL
  if (!user) {
    return res.redirect("/login");
  }


  const templateVars = { user };
  res.render("urls_new", templateVars);
});











//Page for displaying individual created URLS
app.get("/urls/:id", (req, res) => {
  const id = req.session.user_id;
  const user = users[id];
// checks whether the user is logged in
  if (!user) {
    res.send("<html><body>Error please <a href=/login>log in</a> or <a href=/register>register</a> to view URLs.</body></html>");
    return;
  }

  const databaseObject = urlDatabase[req.params.id];
  //checks if a URL exists for the given ID
  if (databaseObject) {
    //checks whether the URL belongs to the logged in user
    if (databaseObject['userID'] !== id) {
      return res.send("This url does not belong to you");
    }
    const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id].longURL, user };
    return res.render("urls_show", templateVars);

  }
  return res.send('URL id does not exist');

});









//Redirects to the corresponding long URL of the given ID
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  //checks whether the given ID exists
  if (!urlDatabase[id]) {
    return res.send('id does not exist');
  }

  const longURL = urlDatabase[id].longURL;
  res.redirect(longURL);
});










//Generates a short URL, saves it, and associates it with the user
app.post("/urls", (req, res) => {
  const user = (req.session.user_id);
// checks whether the user is logged in
  if (!user) {
    return res.send('You must be logged in to shorten URLs');
  }  

  const id = generateRandomString();
  let value = req.body["longURL"];
  urlDatabase[id] = {
    longURL: value,
    userID: user,
  };  
  res.redirect(`/urls/${id}`);
});  











//For editing a URL
app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = req.body.longURL;
  const userId = req.session.user_id;
  const user = users[userId];

  //checks if user is logged in
  if (!user) {
    return res.send("<html><body>Error please <a href=/login>log in</a> or <a href=/register>register</a> to edit URLs.</body></html>");

  }
  //checks if the id exists
  const databaseObject = urlDatabase[req.params.id];
  if (databaseObject) {
    //checks if user owns the url they're trying to edit
    if (databaseObject['userID'] !== userId) {
      return res.send("this url does not belong to you");
    }
    urlDatabase[id] = {
      longURL: longURL,
      userID: req.session.user_id,
    },
      res.redirect("/urls");
    return;
  }
  return res.send('URL id does not exist');

});











//For deleting a saved url
app.post('/urls/:id/delete', (req, res) => {
  const id = req.params.id;
  const userId = req.session.user_id;
  const user = users[userId];

  //checks if user is logged in
  if (!user) {
    return res.send("<html><body>Error please <a href=/login>log in</a> or <a href=/register>register</a> to delete URLs.</body></html>");

  }
  //checks if the id exists
  const databaseObject = urlDatabase[req.params.id];
  if (databaseObject) {
    //checks if user owns the url they're trying to delete
    if (databaseObject['userID'] !== userId) {
      return res.send("this url does not belong to you");
    }
    delete urlDatabase[id];

    res.redirect("/urls");
    return;
  }
  return res.send('URL id does not exist');
});







//Login Page
// Redirects user to main URL page if they're already logged in
app.get("/login", (req, res) => {
  const user = (req.session.user_id);
  if (user) {
    return res.redirect("/urls");
  }  

  res.render("urls_login", { user: null });
});  








//Registration Page
// Redirects user to main URL page if they're already logged in
app.get("/register", (req, res) => {
  const user = (req.session.user_id);
  if (user) {
    return res.redirect("/urls");
  }      
  res.render("urls_register", { user: null });
});      









//Logs in a user and sets a cookie
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const dbUser = getUserByEmail(email, users);
  // checks whether user exists
  if (!dbUser) {
    return res.status(403).send('user not found');
  }

  const result = bcrypt.compareSync(password, dbUser.password);
// checks if password is correct
  if (!result) {

    return res.status(400).send('wrong password');
  }

  req.session.user_id = dbUser.id;
  res.redirect("/urls");
});










//Registers a new user in the users database
//encrypts new users password and sets a cookie
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  //checks if a email and password are being entered
  if (!email || !password) {
    return res.status(400).send('please enter an email and a password');
  }
  //checks if the email is already being used
  const dbUser = getUserByEmail(email, users);

  if (dbUser) {
    return res.status(400).send('email is already in use');
  }

  //creates a new user object
  const id = generateUniqueId();
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);


  const user = {
    id,
    email,
    password: hash
  };

  //updates the user database with the new user
  users[id] = user;
  req.session.user_id = user.id;
  res.redirect("/urls");

});









//Logs user out and deletes cookie
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});  







app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});