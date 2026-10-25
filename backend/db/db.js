import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI,{maxPoolSize:5});
    console.log("conexion a bd exitosa");
  } catch (e) {
    console.log("sucedio un error con la conexion a la bd ",e.message)
    process.exit(1);
  }
}