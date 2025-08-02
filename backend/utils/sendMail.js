import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const sendTaskAssignedEmail = async (to, title, dueDate) => {
  try {
    const info = await transporter.sendMail({
      from: `"Task Flow - VBSB Associates" <${process.env.MAIL_USER}>`,
      to,
      subject: "📝 New Task Assigned",
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; padding: 30px;">
          <div style="max-width: 520px; margin: auto; background: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">
          
            <div style="background: #003366; padding: 16px; text-align: center;">
              <img 
                src="https://ik.imagekit.io/ozu2ek9em/VBSB-Logo-1-2048x754.png?updatedAt=1750846926795" 
                alt="VBSB Logo"
                style="height: 48px; max-width: 200px; object-fit: contain;" 
              />
            </div>
            
            <div style="padding: 24px;">
              <h2 style="color: #2d3748; font-size: 22px; margin-bottom: 12px;">
                📋 You've been assigned a new task!
              </h2>
              <p style="font-size: 16px; color: #555;">
                <strong>🧾 Title:</strong> ${title}<br/>
                <strong>📅 Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}
              </p>

              <p style="margin-top: 20px; font-size: 15px; color: #444;">
                🔔 Please login to your dashboard to view and manage this task.
              </p>

              <div style="text-align: center; margin: 28px 0;">
                <a href="https://vbsb.yourdomain.com/login" 
                  style="background-color: #4b5563; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500;">
                  🔗 Go to Dashboard
                </a>
              </div>

              <p style="font-size: 15px; color: #2d3748; margin-top: 12px;">
                🌟 <em>Wishing you great success and smooth execution — you've got this! 💪</em>
              </p>
            </div>

            <div style="background: #f1f1f1; padding: 12px; text-align: center; font-size: 12px; color: #777;">
              Task Flow System | Powered by VBSB Associates
            </div>
          </div>
        </div>
      `,
    });

    console.log("✅ Task Email sent successfully!");
    console.log("📧 Message ID:", info.messageId);
    console.log("🧑 To:", to);
  } catch (error) {
    console.error("❌ Failed to send task email:");
    console.error("Error Message:", error.message);
    console.error("Full Error:", error);
  }
};

export default sendTaskAssignedEmail;
