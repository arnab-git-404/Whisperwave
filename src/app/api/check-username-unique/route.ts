import { usernameValidation } from "@/schemas/signUpSchema";
import dbConnect from "@/lib/dbConnect.ts";
import UserModel from "@/model/User";
import { z } from "zod";

const UsernameQuerySchema = z.object({
  username: usernameValidation,
});

export async function GET(request: Request) {
  await dbConnect();
  try {
    const { searchParams } = new URL(request.url);
    const queryParam = {
      username: searchParams.get("username"),
    };

    const result = UsernameQuerySchema.safeParse(queryParam);

    if (!result.success) {
      const usernameErrors = result.error.format().username?._errors || [];

      return Response.json(
        {
          success: false,
          message:
            usernameErrors?.length > 0
              ? usernameErrors.join(", ")
              : "Invalid Query Parameters",
        },
        { status: 400 }
      );
    }

    const { username } = result.data;

    const existingVerifiedUser = await UserModel.findOne({
      username,
      isVerified: true,
    });

    if (existingVerifiedUser) {
      return Response.json(
        {
          success: false,
          message: "Username is already taken",
        },
        { status: 400 }
      );
    }

    if (!existingVerifiedUser) {
      return Response.json(
        {
          success: true,
          message: "Username is Available",
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Error While Checking Username", error);
    return Response.json({
      success: false,
      message: "Error while checking Username",
    });
  }
}
