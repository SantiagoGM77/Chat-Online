import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  idUser:{
    type:String,
    unique:true,
    required:[true,"Identificador Obligatorio"]
  },
  messagesContacts:{
    type:Object,
    default:{}
  }
})

export const MESSAGES = mongoose.model("Message",messageSchema);