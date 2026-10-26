import {Model} from "./model.js";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookie from "cookie";
import {cloudinary} from "../config/cloudinary.js";

export class Controller {
  static #setTokensInCookies (payload,res) {
    
    const token = jwt.sign(payload,process.env["JWT_ACCESS_SECRET"],{expiresIn:"15m"})
    
    const tokenRefresh = jwt.sign(payload,process.env["JWT_REFRESH_SECRET"],{expiresIn:"7d"});
  
    res.cookie("token",token,{
      httpOnly:true,
      secure:true,
      sameSite:"none",
      maxAge:60000 * 15
    })
  
    res.cookie("tokenRefresh",tokenRefresh,{
      httpOnly:true,
      secure:true,
      sameSite:"none",
      maxAge:60000 * 60 * 24 * 7
    })
  }
  
  static #getPayloadToken (token,JWT) {
    try {
      const payload = jwt.verify(token,JWT)
      return payload;
    } catch (e) {
      return {error:true,message:"Access denied"}
    }
  }
  
  static async registerUser (req,res) {
    let pathIMG;
    
    let {username,password} = req.body;
  
    let user = await Model.existUser({username});
  
    if (user) return res.send({error:"El Nombre De Usuario Ya Existe"});
  
    let idUser = crypto.randomUUID();
  
    const DATASAVE = {
      username,
      idUser
    }
  
    if (req.file) {
      const {path,filename} = req.file;
      
      DATASAVE.urlPerfil = path;
      DATASAVE.filenamePerfil = filename;
    }
  
    let saltRounds = 10;
  
    let passwordHashed = await bcrypt.hash(password,saltRounds);
  
    DATASAVE.password = passwordHashed;
    
    await Model.createRegistersUserInDBS(DATASAVE);
  
    Controller.#setTokensInCookies({idUser},res);
  
    const DATAUSER = DATASAVE.urlPerfil ? {
      idUser,
      username,
      urlPerfil:DATASAVE.urlPerfil,
      contacts:[]
    } : await Model.getAllDataUser(idUser);
  
    res.send(DATAUSER);
  }
  
  static async loginUser (req,res) {
    let {username,password} = req.body;
  
    const user = await Model.existUser({username});
  
    if (!user) return res.send({error:"No Existe Cuenta Con Ese Nombre",username:true});
    
    let USER = await Model.getDataUserByUsername(username)
  
    let passwordCorrect = await bcrypt.compare(password,USER.password);
  
    if (!passwordCorrect) return res.send({error:"Contraseña Incorrecta",password:true});
  
    const {idUser} = USER;
  
    Controller.#setTokensInCookies({idUser},res)
  
    const dataUser = await Model.getAllDataUser(idUser);
  
    res.send(dataUser);
  }
  
  static async user (req,res) {
    if (!req.session) return res.send({error:"need to log in"});
    else if (req.session.error) return res.send({error:req.session.message});
  
    const dataUser = await Model.getAllDataUser(req.session.idUser)
  
    res.send(dataUser);
  }
  
  static async addContact (req,res) {
    const {idcontact} = req.query;
  
    if (!req.session) return res.send({error:"need to log in"});
    else if (req.session.error) return res.send({error:req.session.message});
  
    const {idUser} = req.session;
    
    if (idUser === idcontact) return res.send({
      error:"You cannot add yourself"
    })
  
    let existUser = await Model.existUser({idUser:idcontact});
  
    if (!existUser) return res.send({invalidContact:true});
  
    let contactAdded = await Model.addContactInDB({idUser,idcontact});
  
    res.send({success:true,contactAdded});
  }
  
  static async changePerfil (req,res) {
    if (!req.session) return res.send({error:"need to log in"});
    else if (req.session.error) return res.send({error:req.session.message});
  
    const {idUser} = req.session;
  
    const {filenamePerfil} = await Model.getDataUserById(idUser)
  
    if (filenamePerfil !== "perfil-default") {
      try {
        await cloudinary.uploader.destroy(filenamePerfil);
      } catch (e) {
        return res.send({error:"La foto de perfil no pudo ser cambiada"})
      }
    }
    
    const {path,filename} = req.file
  
    await Model.updatePerfilOfUser(idUser,path,filename);
  
    res.send({success:true})
  }
  
  static async messages (req,res) {
    const idContact = req.params.id;
  
    if (!req.session) return res.send({error:"need to log in"});
    else if (req.session.error) return res.send({error:req.session.message});

    const {idUser} = req.session;
  
    const messages = await Model.getMessagesWithContact(idUser,idContact);
  
    let {active} = await Model.getDataUserById(idContact);
  
    res.send({messages,active});
  }
  
  static async socketConection (socket) {
    await Model.updateIdConnectionSocketOfUser(socket.idUser,socket.id);
    
    await Model.updateLastConnectionUser(socket.idUser,Date.now());
  
    const saveAndSendMsg = async ({msg,idcontact})=>{
      const {idUser} = socket;
    
      const {idConnection} = await Model.getDataUserById(idcontact)
    
      const timestamp = Date.now();
      
      await Model.pushMessageForContactAndUser(idUser,idcontact,msg,timestamp);
      
      let messagesOfContactWithMe = await Model.getMessagesWithContact(idcontact,idUser);
    
      let amountMessagesUnread = messagesOfContactWithMe.reduce((counter,message)=>{
        const {msgOf,openMSG} = message;
        
        if (msgOf === "contact" && !openMSG) return counter + 1;
        
        return counter;
      },0)
    
      socket.broadcast.to(idConnection).emit("received-message",{idcontact:idUser,msg,timestamp,amountMessagesUnread});
    }
  
    const changeStatusMessages = async ({idcontact,statusMSG}) => {
      const {idUser} = socket;
    
      const {idConnection} = await Model.getDataUserById(idcontact);
    
      socket.broadcast.to(idConnection).emit("change-status-of-messages-send",{msgSendStatus:statusMSG,idcontact:idUser});
    
      if (statusMSG === "read") await Model.changeStatusMessageToReadInBothUsers(idUser,idcontact);
      else if (statusMSG === "received") await Model.changeStatusMessageToReceivedForContact(idcontact,idUser);
    }
  
    const informContactsOfTheDisconnection = async () => {
      let timeNow = Date.now();
    
      const {idUser} = socket;
    
      await Model.updateLastConnectionUser(idUser,timeNow);
    
      const {contactsID} = await Model.getIdContactsUser(idUser);
    
      contactsID.forEach(async (idContact) =>{
        const {idConnection} = await Model.getDataUserById(idContact);
      
        socket.broadcast.to(idConnection).emit("contact-disconnected",{idcontact:idUser,timestamp:timeNow});
      })
    }
  
    const refreshChatOfContact = async (idcontact) => {
      const {idConnection} = await Model.getDataUserById(idcontact);
    
      const {idUser,username,urlPerfil} = await Model.getDataUserById(socket.idUser);
    
      socket.broadcast.to(idConnection).emit("refresh-contact-list",{idUser,username,urlPerfil});
    }
  
    const changeStatusConnectionUser = async ({idcontact,counter}) => {
      let {idUser} = socket;
    
      let {idConnection} = await Model.getDataUserById(idcontact);
    
      socket.broadcast.to(idConnection).emit("online-contact",{idcontact:idUser,counter})
    }
  
    const changeStatusMSGOfcontacts = async () => {
      const {contactsID} = await Model.getIdContactsUser(socket.idUser)
    
      contactsID.forEach(idcontact=>{
        changeStatusMessages({idcontact,statusMSG:"received"});
      })
    }
  
    //CUANDO UN USUARIO SE CONECTA REFRESCAMOS EL ESTADO DE LOS MENSAJES ENVIADOS POR SUS CONTACTOS
    
    changeStatusMSGOfcontacts();
  
    socket.on("send-message",saveAndSendMsg)
  
    socket.on("change-status-message-received",changeStatusMessages);
  
    socket.on("added-contact",refreshChatOfContact);
  
    socket.on("online-user",changeStatusConnectionUser);
  
    socket.on("offline-user",informContactsOfTheDisconnection);
  
    socket.on('disconnect', async () => {
      informContactsOfTheDisconnection()
    
      socket.off("send-message",saveAndSendMsg)
      socket.off("change-status-message-received",changeStatusMessages);
      socket.off("added-contact",refreshChatOfContact);
      socket.off("online-user",changeStatusConnectionUser);
      socket.off("offline-user",informContactsOfTheDisconnection);
    });
  }
  
  static middleWareSession (req,res,next) {
    let token = req.cookies.token,
    tokenRefresh = req.cookies.tokenRefresh
  
    if (!token && !tokenRefresh) req.session = null;
    else if (token) req.session = Controller.#getPayloadToken(token,process.env["JWT_ACCESS_SECRET"]);
    else {
      req.session = Controller.#getPayloadToken(tokenRefresh,process.env["JWT_REFRESH_SECRET"]);
    
      if (!req.session.error) Controller.#setTokensInCookies({idUser:req.session.idUser},res);
    }
  
    next()
  }
  
  static middleWareSessionSocket (socket,next) {
    const cookies = socket.handshake.headers.cookie;
  
    if (cookies) {
      const {token} = cookie.parse(cookies);
    
      let payload = Controller.#getPayloadToken(token,process.env["JWT_ACCESS_SECRET"]);
    
      if (payload.error) next(new Error ("unauthorized"));
      else {
        socket.idUser = payload.idUser;
        next();
      }
    } else next(new Error ("unauthorized"));
  }
}