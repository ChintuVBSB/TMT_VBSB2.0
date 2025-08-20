import Client from "../models/client.js";



export const addClient = async (req, res) => {
  try {
    // taaki yeh frontend se match kare.
    const { name, email, group } = req.body;

    // Validate that a name was provided
    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Client name is required." });
    }

    // Check for existing client by 'name'
    const existingClient = await Client.findOne({ name: name.trim() });
    if (existingClient) {
      return res
        .status(409)
        .json({ message: "A client with this name already exists." });
    }

    // Create the new client
    const client = await Client.create({
      name: name.trim(),
      email: email ? email.trim() : "",
      // ✅ YAHAN BHI CHANGE HUA HAI: 'parent' ki jagah 'group' save kar rahe hain.
      group: group || null, // Store group ID, or null if it's not provided
    });

    res.status(201).json(client);
  } catch (err) {
    console.error("Error adding client:", err);
    if (err.name === "ValidationError") {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: "Server error while adding the client." });
  }
};

export const getClients = async (req, res) => {
  try {
    const clients = await Client.find({})
      // ✅ YAHAN BHI CHANGE HUA HAI: 'parent' ki jagah 'group' ko populate kar rahe hain.
      .populate("group", "name") // Sirf group ka naam populate karna aam taur par kaafi hai
      .sort({ name: 1 });

    res.json(clients);
  } catch (err) {
    console.error("Error fetching clients:", err);
    res.status(500).json({ message: "Server error while fetching clients." });
  }
};


// export const uploadClientsFromCSV = async (req, res) => {
//   try {
//     const { clients } = req.body;

//     if (!clients || !Array.isArray(clients)) {
//       return res.status(400).json({ message: "Invalid data format: 'clients' array is missing." });
//     }

//     const results = {
//       added: 0,
//       skipped: 0,
//       failed: 0,
//       errors: [],
//     };

//     // Iterate through each client entry from the parsed CSV data
//     for (const entry of clients) {
//       // ✅ FIXED: Destructure 'parentName' instead of 'gstin'
//       const { name, email, parentName } = entry;

//       // Basic validation: A client must have a name
//       if (!name || name.trim() === "") {
//         results.skipped++;
//         continue;
//       }

//       try {
//         // Check if a client with the same name already exists (since name is unique)
//         const existingClient = await Client.findOne({ name: name.trim() });
//         if (existingClient) {
//           results.skipped++;
//           continue; // Skip if client already exists
//         }

//         let parentId = null;

//         // ✅ NEW LOGIC: Find the parent's ID if parentName is provided
//         if (parentName && parentName.trim() !== "") {
//           const parentClient = await Client.findOne({ name: parentName.trim() });

//           if (parentClient) {
//             // If parent is found, use its ID
//             parentId = parentClient._id;
//           } else {
//             // If parent is not found, skip this client and log an error
//             results.failed++;
//             results.errors.push(`Parent group '${parentName}' not found for client '${name}'.`);
//             continue;
//           }
//         }

//         // Create the new client with the correct data structure
//         const client = new Client({
//           name: name.trim(),
//           email: email ? email.trim() : "",
//           parent: parentId, // Assign the found parentId or null
//         });

//         await client.save();
//         results.added++;

//       } catch (saveError) {
//         results.failed++;
//         results.errors.push(`Error saving client '${name}': ${saveError.message}`);
//       }
//     }

//     // Construct a more informative response message
//     let message = `${results.added} clients added successfully.`;
//     if (results.skipped > 0) message += ` ${results.skipped} were skipped (already exist or invalid name).`;
//     if (results.failed > 0) message += ` ${results.failed} failed to import.`;

//     res.status(200).json({
//       message,
//       results,
//     });

//   } catch (err) {
//     console.error("CSV Upload Error:", err);
//     res.status(500).json({ message: "An unexpected error occurred during CSV import." });
//   }
// };




// YEH NAYA FUNCTION CSV UPLOAD KE LIYE HAI
export const uploadClientsFromCSV = async (req, res) => {
  // Frontend se { clients: [...] } object aa raha hai
  const { clients } = req.body;

  if (!clients || !Array.isArray(clients)) {
    return res.status(400).json({ message: "Invalid data format." });
  }

  const createdClients = [];
  const errors = [];

  // Hum har client data par ek-ek karke kaam karenge
  for (const clientData of clients) {
    try {
      // Pehle check karein ki client ka naam hai ya nahi
      if (!clientData.name || clientData.name.trim() === "") {
        errors.push({ name: clientData.name, reason: "Name is required." });
        continue; // Is client ko chhod kar agle par jao
      }

      // Check karein ki is naam ka client pehle se to nahi hai
      const existingClient = await Client.findOne({ name: clientData.name.trim() });
      if (existingClient) {
        errors.push({ name: clientData.name, reason: "Client with this name already exists." });
        continue;
      }

      let groupId = null;
      // Agar CSV mein parentName hai, to uski ID dhoondho
      if (clientData.parentName && clientData.parentName.trim() !== "") {
        const parentClient = await Client.findOne({ name: clientData.parentName.trim() });
        
        // Agar parent mil gaya to uski ID use karo
        if (parentClient) {
          groupId = parentClient._id;
        } else {
          // Agar parent nahi mila to error note kar lo
          errors.push({ name: clientData.name, reason: `Parent '${clientData.parentName}' not found.` });
          continue;
        }
      }

      // Ab naya client create karo
      const newClient = await Client.create({
        name: clientData.name.trim(),
        email: clientData.email ? clientData.email.trim() : "",
        group: groupId, // Yahan ID save hogi
      });
      createdClients.push(newClient);

    } catch (err) {
      errors.push({ name: clientData.name, reason: "Server error." });
    }
  }

  res.status(201).json({
    message: `Upload complete. ${createdClients.length} clients added. ${errors.length} failed.`,
    errors: errors,
  });
};