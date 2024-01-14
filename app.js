const express = require('express');
const session = require('express-session');
const app = express();
const sqlite3 = require('sqlite3').verbose()
var cookieParser = require('cookie-parser');
var path = require('path');
const bodyParser = require('body-parser')
app.use(bodyParser.json())
require('dotenv').config()
app.use(bodyParser.urlencoded({ extended: false }))


app.use(session({
  secret: 'key',
  resave: false,
  saveUninitialized: true
}));



app.set('view engine', 'ejs');

var routes = require('./routes/index')

// app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// app.get('/', (req, res) => {
//   res.render('index');
// });
app.use(routes)
app.use(express.static('views'))
// app.use('/login', routes)

app.listen(3000, () => {
  console.log('Servidor iniciado en el puerto 3000');
});

module.exports = app