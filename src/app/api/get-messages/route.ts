import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "next-auth";
import mongoose from "mongoose";

export async function GET(request: Request) {

  await dbConnect();
  const session = await getServerSession(authOptions);

  // console.log("sesssion data :" , session);

  const user: User = session?.user as User;

  console.log("Extract User from Session into Get-Message Route:" , user);


  if ( !session || !session.user) {
    return Response.json(
      {
        success: false,
        message: "Not Authenticated",
      },
      { status: 401 }
    );
  }

  const userId = new mongoose.Types.ObjectId(user._id);

  try {

    const user = await UserModel.aggregate([

      { $match: { _id: userId } },
      { $unwind: "$messages" },
      { $sort: { "messages.createdAt": -1 } },
      { $group: { 
        _id: "$_id", 
        messages: { $push: "$messages" } 
        } },
    ]);


    console.log("User From Get-Message Route :" , user );

    const userPresent = await UserModel.find({ _id: userId });

    console.log("User Present From Get-Message Route :" , userPresent.length );



    return Response.json(
        {
            success: true,
            message: user[0]?.messages,
        },
        { status: 200 }
    );


  } catch (error) {
    console.log('An error occured from Get-Message Route', error);
    return Response.json(
        {
            success: false,
            message: "An error occured in Get-Message Route",
        },
        { status: 500 }
    );
}
}
