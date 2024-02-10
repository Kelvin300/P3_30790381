const express = require('express');
const app = express();
const sqlite3 = require('sqlite3').verbose()
const db = require('../database')
require('dotenv').config()
var router = express.Router();
const USER = process.env.USER
const PASSWORD = process.env.PASSWORD
const axios = require('axios');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const EMAILUSER = process.env.EMAILUSER
const PASSEMAIL= process.env.PASSEMAIL

router.post('/actualizarPass/:token', (req, res) => {
  // Busca el token en la base de datos
  db.get('SELECT * FROM recuperaciones WHERE token = ?', [req.body.token], (err, row) => {
    if (err) {
      console.error(err.message);
      res.status(500).send('Error al buscar el token en la base de datos');
    } else if (row) {
      // Si el token existe, hashea la nueva contraseña
      bcrypt.hash(req.body.newPassword, 12).then(hash => {
        // Actualiza la contraseña del usuario en la base de datos
        db.run('UPDATE usuarios SET password = ? WHERE email = ?', [hash, row.email], (err) => {
          if (err) {
            console.error(err.message);
            res.status(500).send('Error al actualizar la contraseña en la base de datos');
          } else {
            console.log('Se la actualizado el pass ')
            // Redirige al usuario a la página de inicio de sesión
            res.redirect('/loginUser');
          }
        });
      });
    } else {
      console.log('El token no existe')// Si el token no existe, redirige al usuario a la página de inicio
      res.redirect('/');
    }
  });
});


router.get('/recuperarPass/:token', (req, res) => {
  // Busca el token en la base de datos
  db.get('SELECT * FROM recuperaciones WHERE token = ?', [req.params.token], (err, row) => {
    if (err) {
      console.error(err.message);
      res.status(500).send('Error al buscar el token en la base de datos');
    } else if (row) {
      // Si el token existe, renderiza la vista para actualizar la contraseña
      res.render('actualizarPass', {token: req.params.token, name: req.session.name});
      console.log(req.params.token)
    } else {
      // Si el token no existe, redirige al usuario a la página de inicio
      res.redirect('/');
    }
  });
});


router.post('/recuperarPass', (req, res) => {
  // Genera un token
  let token = crypto.randomBytes(20).toString('hex');

  // Guarda el token y el correo electrónico en la base de datos
  db.run('INSERT INTO recuperaciones (email, token) VALUES (?, ?)', [req.body.email, token], (err) => {
    if (err) {
      console.error(err.message);
      res.status(500).send('Error al guardar el token en la base de datos');
    } else {
      console.log(token)
      // Configura el correo
      let mailOptions = {
        from: 'Fishup Store',
        to: req.body.email,
        subject: 'Recuperación de Contraseña',
        text: 'Para recuperar tu contraseña, por favor visita el siguiente enlace: https://task1-interfaz-administrativa-sqlite.onrender.com/recuperarPass/' + token
      };

      // Envia el correo
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
        } else {
          console.log('Email enviado: ' + info.response);
        }
      });

      res.render('passEnv');
    }
  });
});

router.get('/recuperarPass', (req, res) => {
  res.render('recuperarPass', {name: req.session.name});
});

// Configura el transporte de correo
let transporter = nodemailer.createTransport({
  service: 'gmail', // usa el servicio de Gmail
  auth: {
    user: EMAILUSER, // tu correo
    pass: PASSEMAIL // tu contraseña
  }
});

router.post('/submit-payment', (req, res) => {
  // Simula una respuesta exitosa de la API
  const response = {
    data: {
      success: true
    }
  };

  if (response.data.success) {
    const producto_id = req.body.productId; // Obtiene el id del producto del formulario
    const cliente_id = req.session.name; // Obtiene el id del cliente de la sesión
    const cantidad = 1; // Ajusta esto con la cantidad
    const total_pagado = req.body.productPrice; // Ajusta esto con el total pagado
    const fecha = new Date().toISOString();
    const ip_cliente = req.headers['x-forwarded-for'];

    const sql = `INSERT INTO compras (cliente_id, producto_id, cantidad, total_pagado, fecha, ip_cliente) VALUES (?, ?, ?, ?, ?, ?)`;

    db.run(sql, [cliente_id, producto_id, cantidad, total_pagado, fecha, ip_cliente], function(err) {
      if (err) {
        return console.error(err.message);
      }

      let mailOptions = {
        from: 'Fishup Store',
        to: cliente_id,
        subject: 'Has Comprado un producto!' ,
        text: 'Has comprado 1 ' + req.body.productName + ' $' + req.body.productPrice
      };

      // Envia el correo
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
        } else {
          console.log('Email enviado: ' + info.response);
        }
      });
      console.log(`Se ha realizado una compra con el id ${this.lastID}`);
      console.log(cliente_id, producto_id, cantidad, total_pagado, fecha, ip_cliente)
    });

    // Redirige al usuario a la vista principal
    res.render('pago_realizado', {name: req.session.name})
  } else {
    res.send('La validación del pago falló');
  }
});



// const authentication = require("../views/public/authentication.controllers.js");
const loginController = require("../views/public/controllers/loginController")

router.post('/calificacion', (req, res) => {
  const usuario_id = req.body.usuario_id;
  const producto_id = req.body.producto_id;
  const calificacion = req.body.calificacion;

  // Primero, verifica si el usuario ya ha calificado este producto
  const sqlCheck = 'SELECT * FROM calificaciones WHERE usuario_id = ? AND producto_id = ?';
  db.get(sqlCheck, [usuario_id, producto_id], (err, row) => {
    if (err) {
      return console.error(err.message);
    }

    if (row) {
      // Si el usuario ya ha calificado este producto, actualiza la calificación
      const sqlUpdate = 'UPDATE calificaciones SET calificacion = ? WHERE usuario_id = ? AND producto_id = ?';
      db.run(sqlUpdate, [calificacion, usuario_id, producto_id], function(err) {
        if (err) {
          return console.error(err.message);
        }
        console.log(`Calificación actualizada para el usuario ${usuario_id} y el producto ${producto_id}`);
      });
    } else {
      // Si el usuario no ha calificado este producto, inserta una nueva calificación
      const sqlInsert = 'INSERT INTO calificaciones (usuario_id, producto_id, calificacion) VALUES (?, ?, ?)';
      db.run(sqlInsert, [usuario_id, producto_id, calificacion], function(err) {
        if (err) {
          return console.error(err.message);
        }
        console.log(`Nueva calificación insertada para el usuario ${usuario_id} y el producto ${producto_id}`);
      });
    }
  });

  // Redirige al usuario a la vista del producto
  res.redirect('/producto/' + producto_id);
});





router.get('/loginUser', loginController.login)
router.post('/loginUser', loginController.auth)
router.get('/registerUser', loginController.register)
router.post('/registerUser', loginController.storeUser)
router.get('/logout', loginController.logout)

function checkAuthenticated(req, res, next) {
  if (req.session.loggedin) {
    next();
  } else {
    res.redirect('/loginUser');
  }
}

router.get('/pagar', checkAuthenticated, (req, res) => {
  db.get("SELECT * FROM productos WHERE id = ?", [req.query.producto_id], (err, producto) => {
    if (err) {
      console.error(err.message);
      res.status(500).send('Error al consultar la base de datos');
    } else {
      db.get("SELECT url FROM imagenes WHERE producto_id = ? AND destacado = 1", [req.query.producto_id], (err, imagen) => {
        if (err) {
          console.error(err.message);
          res.status(500).send('Error al consultar la base de datos');
        } else {
          // Asegúrate de que 'producto' e 'imagen' se están pasando a la vista correctamente
          res.render('pago', { producto: producto, imagen: imagen, name: req.session.name });
        }
      });
    }
  });
});



router.get('/producto/:id', (req, res) => {
  let sql = 'SELECT productos.*, categorias.nombre AS categoria, GROUP_CONCAT(imagenes.url) AS imagenes FROM productos LEFT JOIN categorias ON productos.categoria_id = categorias.id LEFT JOIN imagenes ON productos.id = imagenes.producto_id WHERE productos.id = ? GROUP BY productos.id';
  
  db.get(sql, [req.params.id], (err, row) => {
    if (err) {
      console.error(err.message);
      res.status(500).send('Error al consultar la base de datos');
    } else {
      // Calcula el promedio de las calificaciones del producto
      const sqlAverage = 'SELECT AVG(calificacion) as promedio FROM calificaciones WHERE producto_id = ?';
      db.get(sqlAverage, [req.params.id], (err, rowAverage) => {
        if (err) {
          console.error(err.message);
          res.status(500).send('Error al consultar la base de datos');
        } else {
          // Si el usuario está logueado, obtener su calificación para este producto
          if (req.session.loggedin) {
            let sqlCalificacion = 'SELECT calificacion FROM calificaciones WHERE usuario_id = ? AND producto_id = ?';
            
            db.get(sqlCalificacion, [req.session.name, req.params.id], (err, rowCalificacion) => {
              if (err) {
                console.error(err.message);
                res.status(500).send('Error al consultar la base de datos');
              } else {
                // Renderizar la vista y pasar el producto, el nombre del usuario, la calificación y el promedio
              
                let promedio = rowAverage.promedio ? rowAverage.promedio.toFixed(1) : 'N/A';
                res.render('vista_producto', { producto: row, name: req.session.name, calificacion: rowCalificacion ? rowCalificacion.calificacion : 0, promedio: promedio});
              }
            });
          } else {
            // Si el usuario no está logueado, renderizar la vista sin calificación pero con el promedio
            let promedio = rowAverage.promedio ? rowAverage.promedio.toFixed(1) : 'N/A';
            res.render('vista_producto', { producto: row, name: req.session.name, calificacion: 0, promedio: promedio });
          }
        }
      });
    }
  });
});


router.get('/', (req, res) => {
  let sqlCategorias = 'SELECT DISTINCT nombre FROM categorias';
  db.all(sqlCategorias, [], (err, categorias) => {
    if (err) {
      console.error(err.message);
      res.status(500).send('Error al consultar la base de datos');
    } else {
      let sql = 'SELECT productos.*, categorias.nombre AS categoria, imagenes.url AS imagen_destacada, COALESCE(AVG(calificaciones.calificacion), 0) as promedio FROM productos LEFT JOIN categorias ON productos.categoria_id = categorias.id LEFT JOIN imagenes ON productos.id = imagenes.producto_id LEFT JOIN calificaciones ON productos.id = calificaciones.producto_id WHERE imagenes.destacado = 1';
      let params = [];

      if (req.query.nombre) {
        sql += ' AND productos.nombre LIKE ?';
        params.push('%' + req.query.nombre + '%');
      }

      if (req.query.promedio) {
        sql += ' GROUP BY productos.id HAVING COALESCE(AVG(calificaciones.calificacion), 0) >= ? AND COALESCE(AVG(calificaciones.calificacion), 0) < ?';
        params.push(req.query.promedio, parseInt(req.query.promedio) + 1);
      } else {
        sql += ' GROUP BY productos.id';
      }

      if (req.query.peso) {
        sql += ' AND productos.peso LIKE ?';
        params.push('%' + req.query.peso + '%');
      }

      if (req.query.categoria) {
        sql += ' AND categorias.nombre LIKE ?';
        params.push('%' + req.query.categoria + '%');
      }

      if (req.query.marca) {
        sql += ' AND productos.marca LIKE ?';
        params.push('%' + req.query.marca + '%');
      }

      if (req.query.descripcion) {
        sql += ' AND productos.descripcion LIKE ?';
        params.push('%' + req.query.descripcion + '%');
      }

      console.log("SQL:", sql); // Agrega esta línea
      console.log("Params:", params); // Agrega esta línea

      db.all(sql, params, (err, rows) => {
        if (err) {
          console.error(err.message);
          res.status(500).send('Error al consultar la base de datos');
        } else {
          let mensaje = '';
          if (rows.length === 0) {
            mensaje = 'No se encontraron productos que coincidan con tu búsqueda.';
          }
          
          // Formatea el promedio con un decimal
          rows.forEach(row => {
            row.promedio = row.promedio ? row.promedio.toFixed(1) : 'Sin calificaciones';
          });

          res.render('productos_listado', { data: rows, categorias: categorias, mensaje: mensaje, name: req.session.name });
        }
      });
    }
  });
});




router.get('/productos', (req, res) => {
  db.all('SELECT * FROM categorias', (err, rows) => {
    if (err) {
      console.error(err.message);
      res.status(500).send('Error al consultar la base de datos');
    } else {
      // Enviar la vista productos.ejs con los datos como parámetro
      res.render('productos', { data: rows });
    }
  });
});

router.post('/productos/create', (req, res) => {
  db.run("INSERT INTO productos (nombre, codigo, precio, descripcion, marca, peso, categoria_id) VALUES (?, ?, ?, ?, ?, ?, ?)", [req.body.nombre, req.body.codigo, req.body.precio, req.body.descripcion, req.body.marca, req.body.peso, req.body.categoria_id], (err) => {
    if (err) {
      console.error(err.message);
      res.status(500).send('Error al insertar el producto en la base de datos');
    } else {
      console.log("Se agrego el producto a la base de datos")
      res.redirect('/tablas')
    }
  });
})

router.get('/productos/:id/edit', (req, res) => {
  db.get("SELECT * FROM productos WHERE id = ?", [req.params.id], (err, row) => {
    if (err) {
      console.error(err.message);
      res.status(500).send('Error al consultar la base de datos');
    } else {
      db.all('SELECT * FROM categorias', (err, rows) => {
        if (err) {
          console.error(err.message);
          res.status(500).send('Error al consultar la base de datos');
        } else {
          res.render('edit_productos', { data: row, categorias: rows });
        }
      });
    }
  });
});

router.post('/productos/:id/update', (req, res) => {
  db.run("UPDATE productos SET nombre = ?, codigo = ?, precio = ?, descripcion = ?, marca = ?, peso = ?, categoria_id = ? WHERE id = ?", [req.body.nombre, req.body.codigo, req.body.precio, req.body.descripcion, req.body.marca, req.body.peso, req.body.categoria_id, req.params.id], (err) => {
    if (err) {
      console.error(err.message);
      res.status(500).send('Error al actualizar el producto en la base de datos');
    } else {
      console.log("Producto Editado correctamente en la base de datos")
      res.redirect('/tablas')
    }
  });
});

router.get('/productos/:id/delete', (req, res) => {
  db.run("DELETE FROM productos WHERE id = ?", [req.params.id], (err) => {
    if (err) {
      console.error(err.message);
      res.status(500).send('Error al borrar el producto de la base de datos');
    } else {
      console.log("Producto eliminado")
      res.redirect('/tablas')
    }
  });
});

router.get('/categorias/:id/edit', (req, res) => {
  db.get("SELECT * FROM categorias WHERE id = ?", [req.params.id], (err, row) => {
    if (err) {
      console.error(err.message);
      res.status(500).send('Error al consultar la base de datos');
    } else {
          res.render('edit_categorias', { data: row});
    }
      });
    })
router.post('/categorias/:id/update', (req, res) => {
  db.run("UPDATE categorias SET nombre = ?", [req.body.nombre], (err) => {
    if (err) {
      console.error(err.message);
      res.status(500).send('Error al actualizar la categoria en la base de datos');
    } else {
      console.log("Categoria editada correctamente en la base de datos")
      res.redirect('/tablas')
    }
  });
});
router.get('/categorias/:id/delete', (req, res) => {
  db.run("DELETE FROM categorias WHERE id = ?", [req.params.id], (err) => {
    if (err) {
      console.error(err.message);
      res.status(500).send('Error al borrar el producto de la base de datos');
    } else {
      console.log("Producto eliminado")
      res.redirect('/tablas')
    }
  });
});

router.post('/categorias/create', (req, res) => {
  db.run("INSERT INTO categorias (nombre) VALUES (?)", [req.body.nombre], (err) => {
    if (err) {
      console.error(err.message);
      res.status(500).send('Error al insertar la categoria en la base de datos');
    } else {
      console.log("Se agrego la categoria a la base de datos")
      res.redirect('/tablas')
    }
  });
})

// Vista principal-------------------------------------------------------
// router.get('/tablas', (req, res) => {
//   db.all('SELECT * FROM productos', (err, rows) => {
//     if (err) {
//       console.error(err.message);
//       res.status(500).send('Error al consultar la base de datos');
//     } else {
//       db.all('SELECT * FROM categorias', (err, rows2) => {
//         if (err) {
//           console.error(err.message);
//           res.status(500).send('Error al consultar la base de datos');
//         } else {
//           db.all('SELECT * FROM imagenes', (err, rows3) => {
//             if(err) {
//               console.error(err.message)
//               res.status(500).send('Error al consultar la base de datos')
//             } else {
//               res.render('tablas', { data: rows, data2: rows2 , data3:rows3});
//             }
//           })
          
//         }
//       });
//     }
//   });
// });

router.get('/tablas', (req, res) => {
  db.all('SELECT * FROM productos', (err, rows) => {
    if (err) {
      console.error(err.message);
      res.status(500).send('Error al consultar la base de datos');
    } else {
      db.all('SELECT * FROM categorias', (err, rows2) => {
        if (err) {
          console.error(err.message);
          res.status(500).send('Error al consultar la base de datos');
        } else {
          db.all('SELECT * FROM imagenes', (err, rows3) => {
            if(err) {
              console.error(err.message)
              res.status(500).send('Error al consultar la base de datos')
            } else {
              db.all('SELECT * FROM usuarios', (err, rows4) => {
                if(err) {
                  console.error(err.message)
                  res.status(500).send('Error al consultar la base de datos')
                } else {
                  db.all('SELECT * FROM compras', (err, rows5) => {
                    if(err) {
                      console.error(err.message)
                      res.status(500).send('Error al consultar la base de datos')
                    } else {
                      res.render('tablas', { data: rows, data2: rows2 , data3:rows3, data4:rows4, data5:rows5});
                    }
                  })
                }
              })
            }
          })
        }
      });
    }
  });
});



router.get('/categorias', (req, res) => {
  db.all('SELECT * FROM categorias', (err, rows) => {
    if (err) {
      console.error(err.message);
      res.status(500).send('Error al consultar la base de datos');
    } else {
          // Enviar la vista productos.ejs con los datos como parámetro
      res.render('categorias', { data: rows });
    }
  });
})

router.get('/productos/:id/add_images', (req, res) => {
  db.get("SELECT * FROM productos WHERE id = ?", [req.params.id], (err, row) => {
    if (err) {
      console.error(err.message);
      res.status(500).send('Error al consultar la base de datos');
    } else {
      res.render('add_images', {data: row})
    }
  });
});

router.get('/productos/:id/delete_images', (req, res) => {
  db.run("DELETE FROM imagenes WHERE producto_id = ?", [req.params.id], (err) => {
    if (err) {
      console.error(err.message);
      res.status(500).send('Error al borrar el producto de la base de datos');
    } else {
      console.log("Imagenes eliminadas")
      res.redirect('/tablas')
    }
  });
});

router.post('/productos/:id/save_images', (req, res) => {
  // Obtener el id del producto desde el parámetro de la ruta
  const productId = req.params.id;

  // Obtener las URLs de las imágenes desde el cuerpo de la petición
  const images = req.body.images;
  const destacado = req.body.destacado;

  // Separar las URLs por comas y recorrer cada una de ellas
  images.split(',').forEach((url) => {
    // Crear un valor con la URL, el id del producto y el destacado
    const value = [
      productId, // El id del producto
      url.trim(), // La URL de la imagen sin espacios en blanco
      url.trim() === destacado.trim() ? 1 : 0, // El destacado como un número (1 si es verdadero, 0 si es falso)
    ];

    // Crear una sentencia SQL que inserte un valor en la tabla imagenes
    const sql = `INSERT INTO imagenes (producto_id, url, destacado) VALUES (?, ?, ?)`;

    // Ejecutar la sentencia SQL en la base de datos
    db.run(sql, value, (err) => {
      if (err) {
        console.error(err.message);
        res.status(500).send('Error al insertar la imagen en la base de datos');
      } else {
        console.log('Se agregó la imagen a la base de datos');
      }
    });
  });

  // Redirigir a la página del producto después de insertar los datos
  res.redirect('/tablas');
});
router.get('/login', (req,res) => {
    res.render('login')
})

router.post('/login', async (req, res) => {
    // Obtener el email y la contraseña del cuerpo de la solicitud
    var email = req.body.email
    var password = req.body.password
    if(email == USER && password == PASSWORD){
        res.redirect('tablas')
    } else {
        res.redirect('login')
    }
})





module.exports = router