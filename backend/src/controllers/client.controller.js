import Client from "../models/client.js";


export const addClient = async (req, res) => {
  try {
    // ✅ FIXED: Destructure 'parent' instead of 'gstin'
    const { name, email, parent } = req.body;

    // Validate that a name was provided
    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Client name is required." });
    }

    // ✅ FIXED: Check for existing client by 'name' as it's the unique field now
    const existingClient = await Client.findOne({ name: name.trim() });
    if (existingClient) {
      return res.status(409).json({ message: "A client with this name already exists." });
    }

    // Create the new client with the updated structure
    const client = await Client.create({
      name: name.trim(),
      email: email ? email.trim() : "", // Make email optional but clean
      parent: parent || null, // Store parent ID, or null if it's not provided
    });

    res.status(201).json(client);
    
  } catch (err) {
    console.error("Error adding client:", err);
    // Provide a more specific error if it's a Mongoose validation error
    if (err.name === 'ValidationError') {
        return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: "Server error while adding the client." });
  }
};
export const getClients = (async (req, res) => {
  const clients = await Client.find({})
    .populate('parent', 'name') // ✅ YEH LINE ADD KAREIN
    .sort({ name: 1 }); // Naam se sort karein

  res.json(clients);
});

// controllers/clientController.js


export const uploadClientsFromCSV = async (req, res) => {
  try {
    const { clients } = req.body;

    if (!clients || !Array.isArray(clients)) {
      return res.status(400).json({ message: "Invalid data format: 'clients' array is missing." });
    }

    const results = {
      added: 0,
      skipped: 0,
      failed: 0,
      errors: [],
    };

    // Iterate through each client entry from the parsed CSV data
    for (const entry of clients) {
      // ✅ FIXED: Destructure 'parentName' instead of 'gstin'
      const { name, email, parentName } = entry;

      // Basic validation: A client must have a name
      if (!name || name.trim() === "") {
        results.skipped++;
        continue;
      }

      try {
        // Check if a client with the same name already exists (since name is unique)
        const existingClient = await Client.findOne({ name: name.trim() });
        if (existingClient) {
          results.skipped++;
          continue; // Skip if client already exists
        }

        let parentId = null;

        // ✅ NEW LOGIC: Find the parent's ID if parentName is provided
        if (parentName && parentName.trim() !== "") {
          const parentClient = await Client.findOne({ name: parentName.trim() });

          if (parentClient) {
            // If parent is found, use its ID
            parentId = parentClient._id;
          } else {
            // If parent is not found, skip this client and log an error
            results.failed++;
            results.errors.push(`Parent group '${parentName}' not found for client '${name}'.`);
            continue;
          }
        }

        // Create the new client with the correct data structure
        const client = new Client({
          name: name.trim(),
          email: email ? email.trim() : "",
          parent: parentId, // Assign the found parentId or null
        });

        await client.save();
        results.added++;

      } catch (saveError) {
        results.failed++;
        results.errors.push(`Error saving client '${name}': ${saveError.message}`);
      }
    }

    // Construct a more informative response message
    let message = `${results.added} clients added successfully.`;
    if (results.skipped > 0) message += ` ${results.skipped} were skipped (already exist or invalid name).`;
    if (results.failed > 0) message += ` ${results.failed} failed to import.`;

    res.status(200).json({
      message,
      results,
    });

  } catch (err) {
    console.error("CSV Upload Error:", err);
    res.status(500).json({ message: "An unexpected error occurred during CSV import." });
  }
};
