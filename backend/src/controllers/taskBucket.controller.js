import TaskBucket from "../models/taskBucket.model.js";

export const createBucket = async (req, res) => {
  try {
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Bucket title is required." });
    }

    const trimmedTitle = title.trim();

    // Check for existing bucket (case-insensitive)
    const existing = await TaskBucket.findOne({
      title: { $regex: `^${trimmedTitle}$`, $options: "i" },
    });

    if (existing) {
      return res.status(409).json({ message: "Bucket with this title already exists." });
    }

    const bucket = await TaskBucket.create({ title: trimmedTitle });
    res.status(201).json(bucket);
  } catch (err) {
    console.error("Error creating bucket:", err);
    res.status(500).json({ message: "Failed to add bucket" });
  }
};


 
export const getBuckets = async (req, res) => {
  try {
    const buckets = await TaskBucket.find();
    res.json(buckets);
  } catch (err) {
    res.status(500).json({ message: "Error fetching buckets" });
  }
};
    
// Get all task buckets
export const getAllTaskBuckets = async (req, res) => {
  try {
    const buckets = await TaskBucket.find().sort({ createdAt: -1 });
    res.status(200).json(buckets);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};


export const uploadTaskBuckets = async (req, res) => {
  try {
    const { buckets } = req.body;

    if (!buckets || !Array.isArray(buckets)) {
      return res.status(400).json({ message: "Invalid or missing buckets array" });
    }

    // Clean & extract titles
    const inputTitles = buckets
      .map((item) => item.title?.trim())
      .filter((title) => !!title);

    if (inputTitles.length === 0) {
      return res.status(400).json({ message: "No valid bucket titles found" });
    }

    // Find duplicates that already exist in DB
    const existingBuckets = await TaskBucket.find({
      title: { $in: inputTitles },
    });

    const existingTitles = existingBuckets.map((bucket) => bucket.title);

    // Filter new titles
    const newTitles = inputTitles.filter(
      (title) => !existingTitles.includes(title)
    );

    if (newTitles.length === 0) {
      return res.status(400).json({ message: "All bucket titles already exist" });
    }

    // Prepare new documents
    const toInsert = newTitles.map((title) => ({ title }));

    await TaskBucket.insertMany(toInsert);

    res.status(200).json({
      message: `${toInsert.length} bucket(s) added successfully`,
      skipped: existingTitles,
    });
  } catch (err) {
    console.error("CSV Upload Error:", err);
    res.status(500).json({ message: "Failed to upload buckets" });
  }
};