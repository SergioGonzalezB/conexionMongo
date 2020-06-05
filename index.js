"use strict";

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const config = require("./config");
const hbs = require("express-handlebars");
const Product = require("./models/product"); //cargar modulo del modelo
const app = express();
const method0verride = require("method-override"); //apirest

const Handlebars = require("handlebars"); //variable para cargar Handlebars
const {
  allowInsecurePrototypeAccess,
} = require("@handlebars/allow-prototype-access"); //variable agregada para solucionar problema

app.put("/", (req, res, next) => {
  res.send("PUT solicitud hecha por Jose Guzman"); //apirest
});

app.engine(
  ".hbs",
  hbs({
    defaultLayout: "index",
    extname: ".hbs",
    handlebars: allowInsecurePrototypeAccess(Handlebars), //esto tambien lo agregue.
  })
);
app.set("view engine", ".hbs");

app.use("/static", express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(method0verride("_method"));

app.get("/", (req, res) => {
  res.render("home");
});

app.put("/", (req, res, next) => {
  res.send("Solicitud de prueba PUT");
});

app.get("/insertar", (req, res) => {
  res.render("product");
});

//Metodo para guardar un nuevo registro
app.post("/api/product", (req, res) => {
  console.log("POST /api/product");
  console.log(req.body);
  let product = new Product();
  product.name = req.body.name;
  product.picture = req.body.picture;
  product.price = req.body.price;
  product.category = req.body.category;
  product.description = req.body.description;
  console.log(req.body);

  product.save((err, productStored) => {
    if (err) res.status(500).send({ message: "Error al guardar en BD:" + err });
    res.redirect("/api/product");
  });
});

//Get para mostrar los productos
app.get("/api/productos", (req, res) => {
  Product.find({}, (err, products) => {
    if (err)
      return res
        .status(500)
        .send({ message: "Error al realizar la peticion:" + err });
    if (!products)
      return res.status(404).send({ message: "No existen productos" });
    res.render("productos", { products });
  });
});

//post para buscar un producto por por Nombre o ID en el buscador
app.post("/api/product/productId", (req, res) => {
  var idProducto = req.body.productId;
  var porNombre = req.body.busqueda;

  if (porNombre == "nombreProducto") {
    Product.find({ name: idProducto }, (err, products) => {
      if (err)
        return res
          .status(500)
          .send({ message: `Error al realizar la busqueda: ${err}` });
      if (!products)
        return res.status(404).send({ message: "El producto no existe" });
      res.render("productos", { products });
    });
  } else if (porNombre == "ID") {
    Product.findById(idProducto, (err, products) => {
      if (err)
        return res
          .status(500)
          .send({ message: `Error al realizar la busqueda: ${err}` });
      if (!products)
        return res.status(404).send({ message: "El producto no existe" });
      res.render("productos", { products });
    });
  }
});

//Get para editar y eliminar registros
app.get("/api/product/:productId", (req, res) => {
  // Incluye la busqueda para definir el registro indicado
  let productId = req.params.productId;
  Product.findById(productId, (err, products) => {
    if (err)
      return res
        .status(500)
        .send({ message: "Error al realizar la peticion: " + err });
    if (!products)
      return res.status(404).send({ message: "El producto no existe" });
    res.render("editar", { products });
  });
});

//Metodo put que permite editar un producto
app.put("/api/product/:productId", (req, res) => {
  let productId = req.params.productId;
  console.log("El producto es: " + productId);

  let update = req.body;
  console.log(update);
  Product.findOneAndUpdate({ _id: productId }, update, (err, products) => {
    if (err)
      res
        .status(500)
        .send({ message: "Error al actualizar el producto: " + err });
    res.redirect("/api/productos");
  });
});

app.delete("/api/product/:productId", (req, res) => {
  let productId = req.params.productId;
  Product.findById(productId, (err, product) => {
    product.remove((err) => {
      if (err)
        res
          .status(500)
          .send({ message: "Error al borrar el producto: " + err });
      res.redirect("/api/productos");
    });
  });
});

mongoose.set("useFindAndModify", false);
mongoose.connect(config.db, config.urlParser, (err, res) => {
  if (err) {
    return console.log("Error al conectar la BD: " + err);
  }

  console.log("Conexion a la BD exitosa");

  app.listen(config.port, () => {
    console.log("Api se esta ejecutando en http://localhost:" + config.port);
  });
});
