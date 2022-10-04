
//Basic web server using the Express.js framework

const express = require("express");
const morgan = require("morgan");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.use(express.urlencoded({ extended: true}));


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
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});



app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});



app.get("/urls/:id", (req, res) => {
  const templateVars = {id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});



app.post("/urls", (req, res) => {
const id = generateRandomString()
  let value = req.body["longURL"]
  urlDatabase[id] = value
  res.redirect(`/urls/${id}`);
});



app.get("/u/:id", (req, res) => {
  
const id = req.params.id
 const longURL = urlDatabase[id]
  res.redirect(longURL);
});


app.post('/urls/:id/delete', (req, res) => {
const id = req.params.id

delete urlDatabase[id]

res.redirect("/urls")
});




app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString() {

  let random = (Math.random().toString(36).slice(6, 12))

  return random
}