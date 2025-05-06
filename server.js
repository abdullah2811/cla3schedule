require("dotenv").config(); // Load environment variables (optional for local testing)
const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

const GITHUB_API_URL = "https://api.github.com";
const REPO_OWNER = "abdullah2811"; // Your GitHub username
const REPO_NAME = "cla3schedule"; // Your repository name
const BRANCH = "main"; // The branch where data.json is stored
const FILE_PATH = "data.json"; // Path to the data.json file in the repository
const TOKEN = process.env.TOKEN; // Use the TOKEN environment variable

// Endpoint to update data.json
app.post("/update-data", async (req, res) => {
  const { data, message } = req.body;

  try {
    // Get the current file SHA
    const fileData = await axios.get(`${GITHUB_API_URL}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
      headers: {
        Authorization: `token ${TOKEN}`
      }
    });

    const sha = fileData.data.sha;

    // Update the file on GitHub
    await axios.put(
      `${GITHUB_API_URL}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`,
      {
        message: message,
        content: Buffer.from(JSON.stringify(data, null, 2)).toString("base64"),
        sha: sha
      },
      {
        headers: {
          Authorization: `token ${TOKEN}`
        }
      }
    );

    res.status(200).send({ message: "File updated successfully" });
  } catch (error) {
    console.error("Error updating file on GitHub:", error);
    res.status(500).send({ error: "Failed to update file" });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});