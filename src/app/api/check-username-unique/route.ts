import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { z } from "zod";
import { usernameValidation } from "@/schemas/signUpSchema";

const UsernameQuerySchema = z.object({
  username: usernameValidation,
});

export async function GET(req: Request) {
  await dbConnect();

  try {
    // localhost:300/api/check-username-unique?username=example
    const { searchParams } = new URL(req.url);
    const queryParam = { username: searchParams.get("username") };
    const result = UsernameQuerySchema.safeParse(queryParam);

    if (!result.success) {
      return Response.json(
        {
          success: false,
          message:
            result.error.format().username?._errors ||
            "Invalid query parameter",
        },
        {
          status: 400,
        }
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
          message: "Username already exists",
        },
        {
          status: 400,
        }
      );
    }

    return Response.json(
      {
        success: true,
        message: "Username is unique",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error while checking username", error);
    return Response.json(
      {
        success: false,
        message: "Error while checking username",
      },
      {
        status: 500,
      }
    );
  }
}
