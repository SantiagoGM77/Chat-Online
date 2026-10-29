import 'dotenv/config';
import express from "express";
import mongoose from "mongoose";
import http from "node:http";
import {Server} from "socket.io";
import path from "node:path";
import cookieParser from "cookie-parser";
import cors from "cors";
import multer from "multer";
import {connectDB} from "./db/db.js";
import {Controller} from "./architecture/controller.js";
import {Model} from "./architecture/model.js";
import {storage} from "./config/cloudinary.js";

connectDB();

const app = express();

app.disable("x-powered-by");

app.use(cors({
  origin:(origin,callback)=>{
    if (origin === process.env.FRONTEND_URL || !origin) return callback(null,true);
    
    callback(new Error("Origin Not Allowed"));
  },
  credentials:true
}))

app.use(cookieParser());

app.use(Controller.middleWareSession);

const fileFilter = async (req,_,cb) => {
  let {username} = req.body;
  
  let user = await Model.existUser({username});
  
  //SI EL USERNAME YA EXISTE NO SUBIMOS LA FOTO DE PERFIL SELECCIONADA Y SI AUN NO EXISTE USUARIO CON ESE USERNAME LA SUBIMOS A LA DB
  
  cb(null,user ? false : true);
}

const upload = multer({
  storage,
  fileFilter
});

app.post("/register",upload.single("photoPerfil"),Controller.registerUser)

app.post("/login",upload.none(),Controller.loginUser)

app.get("/user",Controller.user)

app.post("/add-contact",Controller.addContact)

app.patch("/change-perfil",upload.single("photoPerfil"),Controller.changePerfil)

app.get("/messages/:id",Controller.messages)

app.post("/logout",Controller.logoutUser)

const server = http.createServer(app);

const io = new Server (server,{
  cors:{
    origin:process.env.FRONTEND_URL,
    methods:["GET","POST"],
    credentials:true
  }
});

io.use(Controller.middleWareSessionSocket)

io.on("connection",Controller.socketConection);

let PORT = process.env.PORT || 1234;

server.listen(PORT,()=>{
  console.log(`servidor activado en el puerto ${PORT}`);
})

process.on('SIGUSR2', async () => {
  await mongoose.connection.close();
  console.log('✅ Conexión a MongoDB cerrada por cierre del servidor');
  process.exit(0);
});

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('✅ Conexión a MongoDB cerrada por cierre del servidor');
  process.exit(0);
});
