
//Basic web server using the Express.js framework

const express = require("express");
const morgan = require("morgan");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

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
  const id = req.cookies.user_id;
  const user = users[id];

  if (!user) {
    res.send("<html><body>Error please <a href=/login>log in</a> or <a href=/register>register</a> to view URLs.</body></html>");
    return;
  }

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










app.get("/urls/new", (req, res) => {
  const id = req.cookies.user_id;
  const user = users[id];
  //Checks whether user is logged in before they are allowed to create a new URL
  if (!user) {
    return res.redirect("/login");
  }


  const templateVars = { user };
  res.render("urls_new", templateVars);
});












app.get("/urls/:id", (req, res) => {
  const id = req.cookies.user_id;
  const user = users[id];

  if (!user) {
    res.send("<html><body>Error please <a href=/login>log in</a> or <a href=/register>register</a> to view URLs.</body></html>");
    return;
  }

  const databaseObject = urlDatabase[req.params.id];

  if (databaseObject) {
    if (databaseObject['userID'] !== id) {
      return res.send("This url does not belong to you");
    }
    const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id].longURL, user };
    return res.render("urls_show", templateVars);

  }
  return res.send('URL id does not exist');

});












app.post("/urls", (req, res) => {
  const user = (req.cookies.user_id);

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











//code for redirecting to a url from it's shortend form
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  if (!urlDatabase[id]) {
    return res.send('id does not exist');
  }

  const longURL = urlDatabase[id].longURL;
  res.redirect(longURL);
});













app.get("/register", (req, res) => {
  const user = (req.cookies.user_id);
  if (user) {
    return res.redirect("/urls");
  }
  res.render("urls_register", { user: null });
});


app.get("/login", (req, res) => {
  const user = (req.cookies.user_id);
  if (user) {
    return res.redirect("/urls");
  }

  res.render("urls_login", { user: null });
});












//Code for deleting a saved url
app.post('/urls/:id/delete', (req, res) => {
  const id = req.params.id;
  const userId = req.cookies.user_id;
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
     return
  }
  return res.send('URL id does not exist');
});












app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = req.body.longURL;
  const userId = req.cookies.user_id;
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
      userID: req.cookies.user_id,
    },
   res.redirect("/urls");
   return
  }
  return res.send('URL id does not exist');

});








app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const dbUser = getUserByEmail(email);
  // User not found error check
  if (!dbUser) {
    return res.status(403).send('user not found');
  }
  //incorrect password error check
  if (dbUser && dbUser.password !== password) {
    return res.status(403).send('Incorrect password');
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
  const email = req.body.email;
  const password = req.body.password;

  //checks if a email and password are being entered
  if (!email || !password) {
    return res.status(400).send('please enter an email and a password');
  }
  //checks if the email is already being used
  const dbUser = getUserByEmail(email);

  if (dbUser) {
    return res.status(400).send('email is already in use');
  }
  //creates a new user object
  const id = generateUniqueId();

  const user = {
    id,
    email,
    password
  };

  //updates the user database with the new user
  users[id] = user;
  res.cookie('user_id', user.id);
  res.redirect("/urls");

});







app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
