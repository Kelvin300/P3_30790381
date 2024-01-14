const express = require('express');
const app = express();
const sqlite3 = require('sqlite3').verbose()
const db = require('../database')
require('dotenv').config()
var router = express.Router();
const USER = process.env.USER
const PASSWORD = process.env.PASSWORD
// const authentication = require("../views/public/authentication.controllers.js");
const loginController = require("../views/public/controllers/loginController")



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
  let sql = 'SELECT productos.*, categorias.nombre AS categoria, GROUP_CONCAT(imagenes.url) AS imagenes FROM productos LEFT JOIN categorias ON productos.categoria_id = categorias.id LEFT JOIN imagenes ON productos.id = imagenes.producto_id WHERE productos.id = ? GROUP BY productos.id';  db.get(sql, [req.params.id], (err, row) => {
    if (err) {
      console.error(err.message);
      res.status(500).send('Error al consultar la base de datos');
    } else {

      res.render('vista_producto', { producto: row, name: req.session.name });
    }
  });
});

router.get('/', (req, res) => {
  // if(req.session.loggedin == true){
    let sqlCategorias = 'SELECT DISTINCT nombre FROM categorias';
    db.all(sqlCategorias, [], (err, categorias) => {
      if (err) {
        console.error(err.message);
        res.status(500).send('Error al consultar la base de datos');
      } else {
        let sql = 'SELECT productos.*, categorias.nombre AS categoria, imagenes.url AS imagen_destacada FROM productos LEFT JOIN categorias ON productos.categoria_id = categorias.id LEFT JOIN imagenes ON productos.id = imagenes.producto_id WHERE imagenes.destacado = 1';
        let params = [];
  
        if (req.query.nombre) {
          sql += ' AND productos.nombre LIKE ?';
          params.push('%' + req.query.nombre + '%');
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
  
        db.all(sql, params, (err, rows) => {
          if (err) {
            console.error(err.message);
            res.status(500).send('Error al consultar la base de datos');
          } else {
            let mensaje = '';
            if (rows.length === 0) {
              mensaje = 'No se encontraron productos que coincidan con tu búsqueda.';
            }
            
            res.render('productos_listado', { data: rows, categorias: categorias, mensaje: mensaje, name: req.session.name });
          }
        });
      }
    });
// } else {
//     res.redirect('/loginUser')
// }
  
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
              res.render('tablas', { data: rows, data2: rows2 , data3:rows3});
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
// router.get('/registrar_usuarios', (req, res) => {
//   db.all('SELECT * FROM usuarios', [], (err, rows) => {
//     if (err) {
//       throw err;
//     }
//     rows.forEach((row) => {
//       console.log(row);
//     });
//   });
//   res.render('registrar_usuarios', {err: null})
// })

// router.get('/loguear_usuarios', (req, res) => {
//   res.render('loguear_usuarios')
// })
// router.post('/api/register', authentication.register)
// router.post('/api/login', authentication.login)




module.exports = router