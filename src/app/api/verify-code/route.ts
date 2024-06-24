import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

export async function POST(req: Request) {
  await dbConnect();
  console.log("Verifying code");
  try {
    const { username, code } = await req.json();
    const decodedUsername = decodeURIComponent(username);
    const user = await UserModel.findOne({
      username: decodedUsername,
    });

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        {
          status: 400,
        }
      );
    }

    const isCodeValid = user.verifyCode === code;
    const isCodeExpired = new Date(user.verifyCodeExpiry) > new Date();

    if (!isCodeValid || !isCodeExpired) {
      return Response.json(
        {
          success: false,
          message: "Invalid or expired code",
        },
        {
          status: 400,
        }
      );
    }

    user.isVerified = true;
    await user.save();
    return Response.json(
      {
        success: true,
        message: "User verified",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log("Error verifying code: ", error);
    return Response.json(
      {
        success: false,
        message: "Error verifying code",
      },
      {
        status: 500,
      }
    );
  }
}
