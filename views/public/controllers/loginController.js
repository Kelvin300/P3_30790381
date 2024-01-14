const bcrypt = require('bcrypt');
const { off } = require('../../../app');
const sqlite3 = require('sqlite3').verbose();

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
                        // console.log('agregado')
                        res.redirect('/')
                        // db.all('SELECT * FROM usuarios', [], (err, rows) => {
                        //         if (err) {
                        //           throw err;
                        //         }
                        //         rows.forEach((row) => {
                        //           console.log(row);
                        //         });
                        //       });
                        // //   res.render('registrar_usuarios', {success: 'Usuario registrado con éxito!'});
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