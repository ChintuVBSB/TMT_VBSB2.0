import Project from "../models/projectSchema.js";
import { transporter } from "../../utils/projectMailer.js";
import User from "../models/user.js";
import ChatMessage from "../models/chatMessage.js";
import { generateTaskSerialNumber } from "../helpers/generateSerial.js";


export const createProject = async (req, res) => {
  try {
    const { title, description, deadline, milestones, staffs, lead } = req.body;

     const serial_number = await generateTaskSerialNumber();

    const project = new Project({
      title,
      description,
      deadline,
      milestones,
      staffs,
      lead: lead || null, // optional field
      assignedBy: req.user.id,
      serial_number
    });

    await project.save();

    // ✅ Fetch assigned staff details
    const teamMembers = await User.find({ _id: { $in: staffs } }).select(
      "name email"
    );

    // ✅ Loop through and send email to each staff
    for (const staff of teamMembers) {
      const teamList = teamMembers
        .map((member) => `${member.name} (${member.email})`)
        .join("<br>");

      const mailOptions = {
        from: `"Task Manager - VBSB Associates 👨‍💼" <${process.env.MAIL_USER}>`,
        to: staff.email,
        subject: `🚀 New Project Assigned: ${title}`,
        html: `
  <div style="font-family: Arial, sans-serif; background-color: #f3f4f6; padding: 30px;">
    <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
      
      <!-- Header -->
      <div style="background-color: #003366; padding: 20px; text-align: center;">
        <img 
          src="https://ik.imagekit.io/ozu2ek9em/VBSB-Logo-1-2048x754.png?updatedAt=1750846926795" 
          alt="VBSB Logo" 
          style="height: 45px; object-fit: contain;" />
        <img 
          src="https://ik.imagekit.io/onvky6lf8/tmt-cropped-logo.png?updatedAt=1752832089776" 
          alt="TMT Tool" 
          style="height: 32px; margin-left: 12px; vertical-align: middle;" />
      </div>

      <!-- Content -->
      <div style="padding: 24px;">
      <tr>
  <td style="font-weight: bold;">Team Leader:</td>
  <td>${teamMembers.find((m) => m._id == lead)?.name || "N/A"}</td>
</tr>

        <h2 style="color: #111827; font-size: 20px;">Hello ${staff.name},</h2>
        <p style="color: #4b5563;">You’ve been assigned a new project via <strong>Task Management Tool</strong>.</p>

        <table style="margin-top: 20px; width: 100%; font-size: 14px; color: #1f2937;">
          <tr>
            <td style="font-weight: bold; padding: 8px 0;">📌 Title:</td>
            <td>${title}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; padding: 8px 0;">📝 Description:</td>
            <td>${description}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; padding: 8px 0;">📅 Deadline:</td>
            <td>${new Date(deadline).toDateString()}</td>
          </tr>
          
        </table>

        <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;" />

        <div>
          <p style="font-weight: bold; margin-bottom: 8px;">👥 Team Members:</p>
          <div style="color: #374151; font-size: 14px; line-height: 1.5;">
            ${teamList}
          </div>
        </div>

        <div style="margin-top: 32px; text-align: center;">
          <a href="https://your-app-url.com/dashboard" style="background-color: #2563eb; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            🔍 View Project Dashboard
          </a>
        </div>
        </div>

      <!-- Footer -->
      <div style="background-color: #f9fafb; padding: 16px; text-align: center; font-size: 12px; color: #9ca3af;">
        © ${new Date().getFullYear()} VBSB Associates. All rights reserved.
      </div>
    </div>
  </div>
  `
      };

      await transporter.sendMail(mailOptions);
    }

    res
      .status(201)
      .json({ message: "Project created and emails sent", project });
  } catch (error) {
    console.error("Error assigning project or sending mail:", error);
    res.status(500).json({ message: "Project creation failed", error });
  }
};

export const getProjects = async (req, res) => {
  try {
    const userId = req.user.id;
    let projects = await Project.find({ staffs: userId })
      .populate("staffs", "name role")
      .populate("lead", "name role")
      .populate("assignedBy", "name email")
      .lean();
    res.json({ projects });
  } catch (error) {
    console.error("❌ Error in getProjects:", error);
    res.status(500).json({ message: "Failed to fetch projects", error });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("staffs", "name email")
      .populate("milestones.completedBy", "name")
      .populate("lead", "name role")


    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json({ project });
  } catch (error) {
    res.status(500).json({ message: "Error fetching project", error });
  }
};

// controller/projectController.js

export const completeMilestone = async (req, res) => {
  const { projectId, milestoneId } = req.params;
  const userId = req.user?.id; // ⬅️ From token middleware

  try {
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const milestone = project.milestones.id(milestoneId); // ✅ Correct way to access nested milestone
    if (!milestone)
      return res.status(404).json({ message: "Milestone not found" });

    // ✅ Update fields
    milestone.completed = true;
    milestone.completedAt = new Date();
    milestone.completedBy = userId;

    await project.save();

    res.json({ message: "Milestone marked as completed", milestone });
  } catch (err) {
    console.error("❌ Error completing milestone:", err);
    res.status(500).json({ message: "Milestone update failed", error: err });
  }
};

// controllers/projectController.js

export const addMilestoneToProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, dueDate } = req.body;

    if (!title || !dueDate) {
      return res
        .status(400)
        .json({ message: "Title and Due Date are required" });
    }

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const newMilestone = {
      title,
      dueDate,
      completed: false
    };

    project.milestones.push(newMilestone);
    await project.save();

    res
      .status(200)
      .json({
        message: "Milestone added successfully",
        milestone: newMilestone
      });
  } catch (err) {
    console.error("Error adding milestone:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};


 
