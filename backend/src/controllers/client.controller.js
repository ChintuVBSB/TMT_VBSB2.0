import Client from "../models/client.js";

export const addClient = async (req, res) => {
  try {
    const { name, email, gstin } = req.body;
    if (!name) return res.status(400).json({ message: "Client name required" });

    const existing = await Client.findOne({ email });
    if (existing) return res.status(409).json({ message: "Client already exists" });

    const client = await Client.create({ name, email, gstin });
    res.status(201).json(client);
  } catch (err) {
    console.error("Error adding client:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getClients = async (req, res) => {
  try {
    const clients = await Client.find().sort({ createdAt: -1 });
    res.status(200).json(clients);
  } catch (err) {
    console.error("Error fetching clients:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// controllers/clientController.js

export const uploadClientsFromCSV = async (req, res) => {
  try {
    const { clients } = req.body;

    if (!clients || !Array.isArray(clients)) {
      return res.status(400).json({ message: "Invalid data format" });
    }

    const addedClients = [];

    for (const entry of clients) {
      const { name, email, gstin } = entry;

      if (!name || !email) continue; // basic validation

      const existing = await Client.findOne({ email });
      if (!existing) {
        const client = new Client({ name, email, gstin });
        await client.save();
        addedClients.push(client);
      }
    }

    res.status(200).json({
      message: `${addedClients.length} clients added successfully.`,
      addedClients,
    });
  } catch (err) {
    console.error("CSV Upload Error:", err);
    res.status(500).json({ message: "CSV import failed" });
  }
};
