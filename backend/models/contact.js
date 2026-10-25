import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
  idUser:{
    type:String,
    unique:true,
    required:[true,"Identificador Obligatorio"]
  },
  contactsID:{
    type:Array,
    default:[]
  }
})

export const CONTACTS = mongoose.model("Contact",contactSchema);