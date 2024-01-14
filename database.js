// Requerir el módulo sqlite3
const sqlite3 = require('sqlite3').verbose();

// Crear una base de datos en el archivo db.sqlite
let db = new sqlite3.Database('db.sqlite', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Conectado a la base de datos db.sqlite');
});

// Usar el método serialize para ejecutar las consultas de forma secuencial
db.serialize(() => {
  // Crear la tabla categorias con el campo nombre
  db.run('CREATE TABLE IF NOT EXISTS categorias (id INTEGER PRIMARY KEY AUTOINCREMENT, nombre TEXT)', (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Tabla categorias OK');
  });
  

  // Crear la tabla productos con los campos nombre, codigo, precio, descripcion y categoria_id
  db.run('CREATE TABLE IF NOT EXISTS productos (id INTEGER PRIMARY KEY AUTOINCREMENT, nombre TEXT, codigo TEXT, precio REAL, descripcion TEXT, marca TEXT, peso REAL, categoria_id INTEGER, FOREIGN KEY (categoria_id) REFERENCES categorias (id))', (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Tabla productos OK');
  });

  // Crear la tabla imagenes con los campos producto_id, url y destacado
  db.run('CREATE TABLE IF NOT EXISTS imagenes (producto_id INTEGER, url TEXT, destacado text, FOREIGN KEY (producto_id) REFERENCES productos (id))', (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Tabla imagenes OK');
  });

  // db.run('DROP TABLE IF EXISTS usuarios', (err) => {
  //   if (err) {
  //     console.error(err.message);
  //   }
  //   console.log('Tabla usuarios eliminada');
  // });

  db.run('CREATE TABLE IF NOT EXISTS usuarios (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT, password TEXT)', (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Tabla usuarios OK');
  });

  db.run(`CREATE TABLE IF NOT EXISTS compras (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente_id INTEGER,
    producto_id INTEGER,
    cantidad INTEGER,
    total_pagado REAL,
    fecha DATE,
    ip_cliente TEXT,
    FOREIGN KEY (cliente_id) REFERENCES usuarios (id),
    FOREIGN KEY (producto_id) REFERENCES productos (id)
  )`, (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Tabla compras OK');
  });
  
  

  // Consultar los datos de las tablas
//   db.each("SELECT p.nombre AS producto, c.nombre AS categoria FROM productos p JOIN categorias c ON p.categoria_id = c.rowid", (err, row) => {
//     if (err) {
//       console.error(err.message);
//     }
//     console.log(row.producto + ": " + row.categoria);
//   });
// });

module.exports = db

// No cerrar la conexión a la base de datos
// db.close((err) => {
//   if (err) {
//     console.error(err.message);
//   }
//   console.log('Desconectado de la base de datos db.sqlite');
});
