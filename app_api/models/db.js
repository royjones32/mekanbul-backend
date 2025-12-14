require('dotenv').config();
const mongoose = require('mongoose');

const dbURI = process.env.MONGODB_URI;

mongoose.connect(dbURI);

mongoose.connection.on('connected', function () {
  console.log("Mongoose " + dbURI + " adresindeki veritabanına bağlandı.");
});

mongoose.connection.on('error', function (err) {
  console.log("Mongoose bağlantı hatası.", err);
});

mongoose.connection.on('disconnected', function () {
  console.log("Mongoose bağlantısı kesildi.");
});

// Modeller
require('./venue');

