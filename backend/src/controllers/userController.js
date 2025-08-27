
import User from "../models/user.js"
import bcrypt from "bcrypt"
import fs from "fs";

export const registerUser = async (req, res)=>{
   try {
    
    const {name, email, password , role, status} = req.body

    const existingUser = await User.findOne({email})

    if(existingUser){
        return res.status(400).json({message:"User already exists"})
    }

    const HashedPassoword = await bcrypt.hash(password, 10)

    const newUser = new User({
        name,
        email,
        password: HashedPassoword,
        role,
        status

    })

    await newUser.save()

    res.status(201).json({message:"User created succesfully", user:{
        id:newUser._id,
        name:newUser.name,
        email:newUser.email,
        role:newUser.role,
        status:newUser.status
    }})
   } catch (error) {
    res.status(500).json({message:"Error creating user", error:error.message})
   }
}

// GET /api/user?role=staff
export const getAllUsers = async (req, res) => {
  try {
    const query = {};
    if (req.query.role) {
      query.role = req.query.role;
    }

    const users = await User.find(query);
    res.status(200).json({ users });
  } catch (err) {
    console.error("Failed to fetch users", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};


export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, status} = req.body;

    // Find and update user
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name, role, status},
      { new: true }
    ) 

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to update user",
      error: err.message,
    });
  }
};


export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name } = req.body;
    const photoFile = req.file;

    const updateData = {};

    if (name) updateData.name = name;

    if (photoFile) {
      const photoUrl = `${req.protocol}://${req.get("host")}/uploads/${photoFile.filename}`;
      updateData.photo = photoUrl;
    }

    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    res.status(200).json(user);
  } catch (error) {
    console.error("❌ Failed to update profile:", error);
    res.status(500).json({ message: "Something went wrong." });
  }
};
