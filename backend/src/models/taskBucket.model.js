import mongoose from "mongoose";

const taskBucketSchema = new mongoose.Schema({
  title: { type: String, required: true}
}, { timestamps: true });

export default mongoose.model("TaskBucket", taskBucketSchema);
