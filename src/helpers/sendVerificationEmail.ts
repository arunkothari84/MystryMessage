import { resend } from "@/lib/resend";
import VerificationEmail from "../../emails/VerificationEmail";
import { ApiResponse } from "@/types/ApiResponse";

export async function sendVerificationEmail(
  email: string,
  username: string,
  verifyCode: string
): Promise<ApiResponse> {
  try {
    const { data, error } = await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: email,
      subject: "Verify your email address",
      react: VerificationEmail({ username, otp: verifyCode }),
    });
    console.log("Email sent", data, error);
    return {
      success: true,
      message: "Verification email sent",
    };
  } catch (error) {
    console.log("Error sending verification email", error);
    return {
      success: false,
      message: "Failed to send verification email",
    };
  }
}
