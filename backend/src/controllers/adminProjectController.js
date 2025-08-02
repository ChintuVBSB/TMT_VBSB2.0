import Project from "../models/projectSchema.js";

export const getAllProjects = async (req, res) => {

  try {
    const role = req.user.role;

    if (role !== "admin" && role !== "manager") {
      return res.status(403).json({ message: "Access denied" });
    }

    const projects = await Project.find()
      .populate("staffs", "name email role")
      .populate("assignedBy", "name email");

    res.json({ projects });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch all projects", error });
  }
};
