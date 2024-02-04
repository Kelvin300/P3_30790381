const bcrypt = require('bcrypt');
const { off } = require('../../../app');
const sqlite3 = require('sqlite3').verbose();
const nodemailer = require('nodemailer');
require('dotenv').config()
const EMAILUSER = process.env.EMAILUSER
const PASSEMAIL= process.env.PASSEMAIL

// Configura el transporte de correo
let transporter = nodemailer.createTransport({
  service: 'gmail', // usa el servicio de Gmail
  auth: {
    user: 'kendalltrece@gmail.com', // tu correo
    pass: 'wolootvvtmvrwjri' // tu contraseña
  }
});

let db = new sqlite3.Database('db.sqlite', (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Conectado a la base de datos db.sqlite');
  });

function login(req, res){
    if(req.session.loggedin != true){
        res.render('loguear_usuarios', {err: null})
    } else {
        res.redirect('/')
    }
    
}
function auth(req, res){
    const data = req.body

    db.get('SELECT * FROM usuarios WHERE email = ?', [data.email], (err, userdata) => {
        if(userdata){
            bcrypt.compare(data.password, userdata.password, (err, isMatch) => {
                if(!isMatch){
                    res.render('loguear_usuarios', { err: 'Error: Clave incorrecta !'})
                } else {
                   req.session.loggedin = true;
                   req.session.name = data.email

                   res.redirect('/')
                }
            })
        } else {
            res.render('loguear_usuarios', { err: 'Error: El usuario no existe !'})
        }
    })
}
function register(req, res){
    if(req.session.loggedin != true){
        res.render('registrar_usuarios', {err: null})
    } else {
        res.redirect('/')
    }
   
}

function storeUser(req, res){
    const data = req.body

    db.get('SELECT * FROM usuarios WHERE email = ?', [data.email], (err, userdata) => {
        if(userdata){
            res.render('registrar_usuarios', { err: 'Error: El usuario ya existe !'})
        } else {
            bcrypt.hash(data.password, 12).then(hash => {
                data.password = hash;
        
                db.run('INSERT INTO usuarios (email, password) VALUES (?, ?)', [data.email, data.password], (err) => {
                    if (err) {
                      console.error(err.message);
                      res.render('registrar_usuarios', {err: 'Error al insertar el usuario en la base de datos'});
                    } else {
                        req.session.loggedin = true;
                        req.session.name = data.email
                        // Configura el correo
                        let mailOptions = {
                            from: 'kendalltrece@gmail.com',
                            to: data.email,
                            subject: 'Bienvenido a Fishup - Productos de pesca',
                            text: 'Gracias por registrarte en nuestra página. ¡Esperamos que disfrutes tu experiencia!'
                          };
  
                          // Envia el correo
                          transporter.sendMail(mailOptions, (error, info) => {
                            if (error) {
                              console.log(error);
                            } else {
                              console.log('Email enviado: ' + info.response);
                            }
                          });
  
                          res.redirect('/')
                    }
                  });
            })
        }
    })
    

}

function logout(req, res){
    if(req.session.loggedin === true){
        req.session.destroy();
    }
    res.redirect('/')
}
module.exports = {
    login,
    register,
    storeUser,
    auth,
    logout
}