const express = require('express');
const app = express();
const Usuario = require('../models/usuario');
const bcrypt = require('bcrypt');
const _ = require('underscore');
const { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion');

app.get('/usuario', verificaToken, (req, res) => {

    let estadoActivo = {
        estado: true
    };

    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

    Usuario.find(estadoActivo, 'nombre email role estado google img').skip(desde).limit(limite).exec((err, usuarios) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        Usuario.count(estadoActivo, (err, cantidad) => {
            res.json({
                ok: true,
                usuarios,
                cantidad
            });
        });
    });

});

app.post('/usuario', [verificaToken, verificaAdmin_Role], function(req, res) {

    let body = req.body;

    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    });

    usuario.save((err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        // usuarioDB.password = null;

        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });

});

app.put('/usuario/:id', [verificaToken, verificaAdmin_Role], function(req, res) {

    let id = req.params.id;
    //let body = req.body;

    /* delete body.password;
     delete body.google;*/
    let body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado']);

    let returnNew = {
        new: true
            // runValidators: false
    };


    Usuario.findByIdAndUpdate(id, body, returnNew, (err, usuarioDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        });

    });

});

app.delete('/usuario/:id', [verificaToken, verificaAdmin_Role], function(req, res) {

    let id = req.params.id;

    // Eliminar el usuario de la base de datos
    /*  Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {

          if (err) {
              return res.status(400).json({
                  ok: false,
                  err
              });
          }

          if (!usuarioBorrado) {
              return res.status(400).json({
                  ok: false,
                  err: {
                      message: 'Usuario no encontrado'
                  }
              });
          }

          res.json({
              ok: true,
              usuario: usuarioBorrado
          });

      });*/

    // Cambiar el estado del usuario
    Usuario.findByIdAndUpdate(id, { estado: false }, { new: true }, (err, usuarioBorrado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            usuario: usuarioBorrado
        });

    });

});


module.exports = app;