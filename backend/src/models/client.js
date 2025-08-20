import mongoose from "mongoose";

const clientSchema = new mongoose.Schema(
  {
    // Client ka naam, jaise "ABC Pvt Ltd" ya "Tata Group"
    name: {
      type: String,
      required: true,
      unique: true, // Har client ka naam unique hona chahiye
    },
    // Client ka email (Optional)
    email: {
      type: String,
      // unique: true, // Aap ise unique rakh sakte hain agar chahein
      sparse: true, // Isse null values par unique constraint nahi lagega
    },

    //  Parent-Child relationship ke liye
    // YAHAN CHANGE KIYA GAYA HAI: 'parent' ko 'group' kar diya gaya hai
    // taaki yeh frontend se match kare.
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client", // Yeh 'Client' model ko hi refer kar raha hai
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Client = mongoose.model("Client", clientSchema);

export default Client;