import dbConnect from "@/lib/dbConnect";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import UserModel from "@/model/User";
import exp from "constants";

export async function POST(request: Request) {
  await dbConnect();
  try {
    const { username, email, password } = await request.json();
    const existingUserVerifiedByUsername = await UserModel.findOne({
      username,
      isVerified: true,
    });

    if (existingUserVerifiedByUsername) {
      return Response.json(
        {
          success: false,
          message: "Username already taken.",
        },
        {
          status: 400,
        }
      );
    }

    const existingUserByEmail = await UserModel.findOne({ email });
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    if (existingUserByEmail) {
      if (existingUserByEmail.isVerified) {
        return Response.json(
          {
            success: false,
            message: "Email already taken.",
          },
          {
            status: 400,
          }
        );
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        const expiryDate = new Date();
        existingUserByEmail.password = hashedPassword;
        existingUserByEmail.verifyCode = verifyCode;
        existingUserByEmail.isVerified = false;
        expiryDate.setHours(expiryDate.getHours() + 1);
        existingUserByEmail.verifyCodeExpiry = expiryDate;
        await existingUserByEmail.save();
      }
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);

      const newUser = new UserModel({
        username,
        email,
        password: hashedPassword,
        verifyCode,
        verifyCodeExpiry: expiryDate,
        isVerified: false,
        isAcceptingMessage: true,
        messages: [],
      });

      await newUser.save();
    }

    // send verification email
    const emailResponse = await sendVerificationEmail(
      email,
      username,
      verifyCode
    );
    console.log("emailResponse: ", emailResponse);
    if (!emailResponse.success) {
      return Response.json(
        {
          success: false,
          message: "Failed to send verification email",
        },
        {
          status: 500,
        }
      );
    }
    console.log(verifyCode);
    return Response.json({
      success: true,
      message:
        "User created, please verify your Email address. Please enter this verification code: " +
        verifyCode,
    });
  } catch (error) {
    console.log("Error in sign-up route: ", error);
    return Response.json(
      {
        success: false,
        message: "An error occurred while signing up. Please try again later.",
      },
      {
        status: 500,
      }
    );
  }
}
