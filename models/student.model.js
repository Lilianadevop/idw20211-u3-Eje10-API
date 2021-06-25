const mongoose = require("mongoose");
const beautifyUnique = require('mongoose-beautiful-unique-validation');
const mongooseValidationErrorTransform = require('mongoose-validation-error-transform');
mongoose.plugin(mongooseValidationErrorTransform);

const schema = new mongoose.Schema({
  firstname: {
    type: String,
    required: [true, "Le falta el nombre"],
    maxlenght: [50, "Excedio el limite de caracteres"],
    uppercase: [true, "El nombre debe ir en mayusculas"],
  },
  lastname: {
    type: String,
    required: [true, "Le falta el apellido"],
    maxlenght: [50, "Excedio el limite de caracteres"],
    uppercase: [true, "El apellido debe ir en mayusculas"],
  },
  curp: {
    type: String,
    required: [true, "Le falta su CURP"],
    uppercase: [true, "La CURP debe ir en mayusculas"],
    match: [
      /^([A-Z][AEIOUX][A-Z]{2}\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])[HM](?:AS|B[CS]|C[CLMSH]|D[FG]|G[TR]|HG|JC|M[CNS]|N[ETL]|OC|PL|Q[TR]|S[PLR]|T[CSL]|VZ|YN|ZS)[B-DF-HJ-NP-TV-Z]{3}[A-Z\d])(\d)$/,
      "Su CURP no es valida",
    ],
  },
  create_date: {
    type: Date,
    required: [true, "Le falta la Fecha"],
    default: new Date(),
  },
  controlnumber: {
    type: String,
    required: [true, "Le falta el NC"],
    unique: 'El NC ({VALUE}) ya existe'
  },
  grade: {
    type: Number,
    required: [true, "Le falta la calificación"],
    min: [0, "Calificación invalida debe ser mayor a 0"],
    max: [100, "Calificación invalida debe ser menor a 0"],
  },
  carrer: {
    type: String,
    required: [true, "Le falta su la carrera"],
    enum: {
      values: ["ISC","IM","IGE","IC"],
      message: "Carrera {VALUE} no valida",
    },
  },
});


schema.plugin(beautifyUnique);

const studentModel = mongoose.model("Student", schema, "student");
module.exports = studentModel;