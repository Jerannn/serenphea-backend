import { sendEmail } from "../utils/email.js";
import { getOtpRegisterTemplate } from "../utils/email.template.js";
import { generateOTP } from "../utils/generateOtp.js";

const handleEmail = async (email: string, otp: string) => {
  const html = getOtpRegisterTemplate(otp);

  await sendEmail({
    to: email,
    subject: "Your Serenphéa verification code (expires in 15 minutes)",
    text: `
        Welcome to Serenphéa!
        Your verification code is: ${otp}
        This code will expire in 15 minutes.
        For your security, do not share this code with anyone.
        `,
    html,
  });
};

const authService = {
  handleEmail,
};

export default authService;
