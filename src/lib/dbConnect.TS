import mongoose from "mongoose";

type ConnectionObjecct = {
  isConnected?: number;
};

const connection: ConnectionObjecct = {};

async function dbConnect() {
  
  if (connection.isConnected) {
    console.log("Using existing connection");
    return;
  }

  try {
    const db = await mongoose.connect(process.env.MONGODB_URL || "");

    // console.log(db);
    
    connection.isConnected = db.connections[0].readyState;

    console.log("DB connected " + connection.isConnected ) ;
  
  } catch (error) {
  
    console.log("DB connection failed " + error);
    process.exit(1);

  }
}

export default dbConnect;
