import nodemailer from "nodemailer";

export const sendOTPEmail = async (to, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail", // Or use SMTP config
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });
 
 const mailOptions = {
  from: `"Task Manager - VBSB Associates 👨‍💼" <${process.env.MAIL_USER}>`,
  to,
  subject: "Your OTP for Login",
  html: `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; padding: 30px;">
      <div style="max-width: 480px; margin: auto; background: white; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.08); overflow: hidden;">
        <div style="background: #003366; padding: 16px; text-align: center;">
          <img 
            src="https://ik.imagekit.io/ozu2ek9em/VBSB-Logo-1-2048x754.png?updatedAt=1750846926795" 
            alt="VBSB Logo" 
            style="height: 48px; max-width: 200px; object-fit: contain;" 
          />
        </div>
        <div style="padding: 24px;">
          <h2 style="color: #333; font-size: 20px; margin-bottom: 12px;">
            🛡️ Your One Time Password (OTP)
          </h2>
          <p style="font-size: 16px; color: #555; margin: 0;">
            Use the OTP below to log in securely to your VBSB account:
          </p>
          <div style="margin: 24px 0; text-align: center;">
            <span style="font-size: 32px; font-weight: bold; color: #6b21a8;">${otp}</span>
          </div>
          <p style="font-size: 14px; color: #888;">
            This OTP is valid for <strong>2 minutes</strong>.
          </p>
          <p style="font-size: 13px; color: #999; margin-top: 20px;">
            If you did not request this OTP, you can safely ignore this email.
          </p>
        </div>
        <div style="background: #f1f1f1; padding: 12px; text-align: center; font-size: 12px; color: #777;">
          © ${new Date().getFullYear()} VBSB Associates. All rights reserved.
        </div>
      </div>
    </div>
  `
};



  await transporter.sendMail(mailOptions);
};
