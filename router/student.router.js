const router = require("express").Router();
const mongoose = require("mongoose");
var status = require("http-status");

mongoose.Promise = global.Promise;

mongoose.connect("mongodb://localhost:27017/students", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const Student = require("../models/student.model");

module.exports = () => {
  router.post("/", (req, res) => {
    var stu = req.body;
    Student.create(stu)
      .then((data) => {
        res.json({
          code: status.OK,
          msg: "Insertado con exito",
          data: data,
        });

      })
      .catch((err) => {
        res.status(status.BAD_REQUEST).json({
          code: status.BAD_REQUEST,
          msg: "Ocurrió un error",
          err: err.name,
          detail: err.message,
        });
      });
  });
  // *-*-*-*-*-*-*-*-*-*-* Eliminar por NC *-*-*-*-*-*-*
  router.delete("/:cn", (req, res) => {
    Student.deleteOne({ controlnumber: req.params.cn })
      .then((data) => {
        res.json({
          code: status.OK,
          msg: "Eliminado con exito",
          date: data,
        });
      })
      .catch((err) => {
        res.status(status.BAD_REQUEST).json({
          code: status.BAD_REQUEST,
          msg: "Error en la peticion",
          err: err.name,
          detail: err.message,
        });
      });
  });
  router.get("/", (req, res) => {
    Student.find({})
      .then((students) => {
        res.json({
          code: status.OK,
          msg: "Consultado con exito",
          data: students,
        });
      })
      .catch((err) => {
        res.status(status.BAD_REQUEST).json({
          code: status.BAD_REQUEST,
          msg: "Error en la petición",
          err: err.name,
          detail: err.message,
        });
      });
  });
  //*-*-*-*-*-*-*-*-*- Buscar por el NC -*-*-*-*-*-*-*-*-*-*-*
  router.get("/buscar/:nc", (req, res) => {
    Student.findOne({ controlnumber: req.params.nc })
      .then((students) => {
        if (students == null)
          res.json({
            code: status.NOT_FOUND,
            msg: "NC no fue posible encontrarlo",
          });
        else
          res.json({
            code: status.OK,
            msg: "Consultado con exito",
            data: students,
          });
      })
      .catch((err) => {
        res.status(status.BAD_REQUEST).json({
          code: status.BAD_REQUEST,
          msg: "Error en la petición",
          err: err.name,
          detail: err.message,
        });
      });
  });
  //*-*-*-*-*-* Actualización de la calificación por el NC *-*-*-*-*-*-*-*-
  router.put("/:nc", (req, res) => {
    Student.updateOne(
      { controlnumber: req.params.nc },
      { $set: { grade: req.body.grade } },
      { new: true }
    )
      .then((Student) => {
        if (Student)
          res.json({
            code: status.OK,
            msg: "Actualizado con exito",
            data: Student,
          });
        else
          res.status(status.BAD_REQUEST).json({
            code: status.BAD_REQUEST,
            msg: "Actualización fallida",
          });
      })
      .catch((err) => {
        res.status(status.BAD_REQUEST).json({
          code: status.BAD_REQUEST,
          msg: "Error en la petición",
          err: err.name,
          detail: err.message,
        });
      });
  });
  //*-*-*-*-*-*-*-*-* Aprobados y no aprobados por carrera -*-*-*-*-*-*-*-*-*-*
  router.get("/AproH-M", (req, res) => {
    Student.aggregate([
      {
        $match: { grade: { $gte: 70 } },
      },
      {
        $group: {
          _id: "$carrer",
          count: { $sum: 1 },
        },
      },
    ])
      .then((aprobado) => {
        Student.aggregate([
          {
            $match: { grade: { $lt: 70 } },
          },
          {
            $group: {
              _id: "$carrer",
              count: { $sum: 1 },
            },
          },
        ])
          .then((reprobado) => {
            res.json({
              code: status.OK,
              msg: "Datos",
              reprobados: reprobado,
              aprobados: aprobado,
            });
          })
          .catch((err) => {
            res.status(status.BAD_REQUEST).json({
              code: status.BAD_REQUEST,
              msg: "Error en la petición",
              err: err.name,
              detail: err.message,
            });
          });
      })
      .catch((err) => {
        res.status(status.BAD_REQUEST).json({
          code: status.BAD_REQUEST,
          msg: "Error en la petición",
          err: err.name,
          detail: err.message,
        });
      });
  });
  //*-*-*-*-*-*-*-*-* Busqueda hombre y mujeres por carrera *-*-*-*-*-*-*-*-
  router.get("/H-M", (req, res) => {
    Student.aggregate([
      {
        $match: { curp: /^.{10}[h,H].*/ },
      },
      {
        $group: {
          _id: "$carrer",
          count: { $sum: 1 },
        },
      },
    ])
      .then((hombre) => {
        Student.aggregate([
          {
            $match: { curp: /^.{10}[m,M].*/ },
          },
          {
            $group: {
              _id: "$carrer",
              count: { $sum: 1 },
            },
          },
        ])
          .then((mujer) => {
            res.json({
              code: status.OK,
              msg: "Datos",
              hombres: hombre,
              mujeres: mujer,
            });
          })
          .catch((err) => {
            res.status(status.BAD_REQUEST).json({
              code: status.BAD_REQUEST,
              msg: "Error en la petición",
              err: err.name,
              detail: err.message,
            });
          });
      })
      .catch((err) => {
        res.status(status.BAD_REQUEST).json({
          code: status.BAD_REQUEST,
          msg: "Error en la petición",
          err: err.name,
          detail: err.message,
        });
      });
  });
  //*-*-*-*-*-*-*-*-* Busqueda de los Estudiantes foraneos *-*-*-*-*-*-*-*-*
  router.get("/EForaneros", (req, res) => {
    Student.aggregate([
      {
        $match: { curp: /^.{11}[nt|NT]./ },
      },
      {
        $group: {
          _id: "$carrer",
          count: { $sum: 1 },
        },
      },
    ])
      .then((local) => {
        Student.aggregate([
          {
            $match: { curp: /^.{11}(?!([nt|NT])).*/ },
          },
          {
            $group: {
              _id: "$carrer",
              count: { $sum: 1 },
            },
          },
        ])
          .then((foraneo) => {
            res.json({
              code: status.OK,
              msg: "Datos",
              locales: local,
              foraneos: foraneo,
            });
          })
          .catch((err) => {
            res.status(status.BAD_REQUEST).json({
              code: status.BAD_REQUEST,
              msg: "Error en la petición",
              err: err.name,
              detail: err.message,
            });
          });
      })
      .catch((err) => {
        res.status(status.BAD_REQUEST).json({
          code: status.BAD_REQUEST,
          msg: "Error en la petición",
          err: err.name,
          detail: err.message,
        });
      });
  });
  //*-*-*-*-*-* Busqueda moyores y menores por carrera
  router.get("/Repro", (req, res) => {
    Student.aggregate([
    { $match: { curp: /(.{4}[0-9][0-9][0-9][0-9][0-9][0-9].{6}[0-9][0-9])|(.{4}[0][0-3][0-9][0-9][0-9][0-9].{6}[A-Z,a-z][0-9])/ } },
      { $group: { _id: "$carrer", count: { $sum: 1 } } },
    ])
      .then((mayor) => {
        Student.aggregate([
          { $match: { curp: /^(?!((.{4}[0-9][0-9][0-9][0-9][0-9][0-9].{6}[0-9][0-9])|(.{4}[0][0-3][0-9][0-9][0-9][0-9].{6}[A-Z,a-z][0-9])))/ } },
          { $group: { _id: "$carrer", count: { $sum: 1 } } },
        ])
          .then((menor) => {
            res.json({
              code: status.OK,
              msg: "Mayores y menores",
              Mayores: mayor,
              Menores: menor,
            }); //*-*-*-*-*-*-*-*-* JSON para los reprobrados *-*-*-*-*-*-*-*-*-*
          })
          .catch((err) => {
            res.status(status.BAD_REQUEST).json({
              code: status.BAD_REQUEST,
              msg: "Error en la petición",
              err: err.name,
              detail: err.message,
            });
          });
      })
      .catch((err) => {
        res.status(status.BAD_REQUEST).json({
          code: status.BAD_REQUEST,
          msg: "Error en la petición",
          err: err.name,
          detail: err.message,
        });
      });
  });
  return router;
};