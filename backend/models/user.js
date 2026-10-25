import mongoose from "mongoose";

const schemaUser = new mongoose.Schema({
  idUser:{
    type:String,
    unique:true,
    required:[true,"Identificador Obligatorio"]
  },
  username:{
    type:String,
    unique:true,
    required:[true,"Nombre De Usuario Obligatorio"]
  },
  password:{
    type:String,
    unique:true,
    required:[true,"Contraseña Obligatoria"]
  },
  urlPerfil:{
    type:String,
    default:process.env.DEFAULT_PROFILE_IMAGE
  },
  filenamePerfil:{
    type:String,
    default:"perfil-default"
  },
  active:{
    type:Number,
    default:0
  },
  idConnection:{
    type:String,
    default:""
  }
})

export const USERS = mongoose.model("Users",schemaUser);