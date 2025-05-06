const GITHUB_API_URL = "https://api.github.com";
const REPO_OWNER = "abdullah2811"; // Your GitHub username
const REPO_NAME = "cla3schedule.github.io"; // Your repository name
const BRANCH = "main"; // The branch where data.json is stored
const FILE_PATH = "data.json"; // Path to the data.json file in the repository
const TOKEN = "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"; // Your GitHub PAT

let data = null;

// Fetch data from the GitHub raw URL
fetch(`https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/${FILE_PATH}`)
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(jsonData => {
    data = jsonData; // Assign the fetched data to the global `data` variable
    loadData(); // Call the `loadData` function to populate the page
  })
  .catch(error => console.error("Error loading data:", error));

function showDay(day) {
  // Hide all day schedules
  document.querySelectorAll('.day-schedule').forEach(el => {
    el.classList.remove('active');
  });

  // Show selected day
  document.getElementById(day).classList.add('active');

  // Update active button
  document.querySelectorAll('.day-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.textContent.toLowerCase() === day) btn.classList.add('active');
  });
}

// Load saved data
function loadData() {
  ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'tasks', 'bus'].forEach(section => {
    if (section === 'bus') {
      document.getElementById('bus-on-from-campus').innerHTML = data.bus.onfromCampus;
      document.getElementById('bus-on-to-campus').innerHTML = data.bus.ontoCampus;
      document.getElementById('bus-off-from-campus').innerHTML = data.bus.offfromCampus;
      document.getElementById('bus-off-to-campus').innerHTML = data.bus.offtoCampus;
    } else {
      document.getElementById(`${section}-content`).innerHTML = data[section].content;
    }

    document.getElementById(`${section}-editor`).textContent =
      data[section].lastEditedBy ? `Last edited by: ${data[section].lastEditedBy}` : '';
  });
}

// Enable editing
function enableEditing(section) {
  const name = prompt("Enter your full name:");
  const studentId = prompt("Enter your student ID:");
  if (!name || !studentId) return alert("Name and Student ID are required!");

  if (section === 'bus') {
    const onFromCampusElement = document.getElementById('bus-on-from-campus');
    const onToCampusElement = document.getElementById('bus-on-to-campus');
    const offFromCampusElement = document.getElementById('bus-off-from-campus');
    const offToCampusElement = document.getElementById('bus-off-to-campus');

    onFromCampusElement.contentEditable = true;
    onToCampusElement.contentEditable = true;
    offFromCampusElement.contentEditable = true;
    offToCampusElement.contentEditable = true;
    onFromCampusElement.focus();

    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Save Changes';
    saveBtn.onclick = () => {
      data.bus = {
        onfromCampus: onFromCampusElement.innerHTML,
        ontoCampus: onToCampusElement.innerHTML,
        offfromCampus: offFromCampusElement.innerHTML,
        offtoCampus: offToCampusElement.innerHTML,
        lastEditedBy: `${name} (ID: ${studentId})`
      };
      updateDataOnGitHub(); // Save changes to GitHub
      saveBtn.remove();
    };
    document.getElementById('bus-content').appendChild(saveBtn);
  } else {
    const element = document.getElementById(`${section}-content`);
    element.contentEditable = true;
    element.focus();

    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Save Changes';
    saveBtn.onclick = () => {
      data[section] = {
        content: element.innerHTML,
        lastEditedBy: `${name} (ID: ${studentId})`
      };
      updateDataOnGitHub(); // Save changes to GitHub
      saveBtn.remove();
    };
    element.parentNode.appendChild(saveBtn);
  }
}

// Update data.json on GitHub
function updateDataOnGitHub() {
  // Get the current file SHA (required for updating files on GitHub)
  fetch(`${GITHUB_API_URL}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
    headers: {
      Authorization: `token ${TOKEN}`
    }
  })
    .then(response => response.json())
    .then(fileData => {
      const sha = fileData.sha; // Get the SHA of the current file

      // Prepare the updated file content
      const updatedContent = {
        message: "Update data.json via website",
        content: btoa(JSON.stringify(data, null, 2)), // Encode the updated data in Base64
        sha: sha
      };

      // Send the update request to GitHub
      fetch(`${GITHUB_API_URL}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
        method: "PUT",
        headers: {
          Authorization: `token ${TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updatedContent)
      })
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(() => {
          alert("Changes saved to GitHub!");
        })
        .catch(error => console.error("Error updating data.json on GitHub:", error));
    })
    .catch(error => console.error("Error fetching file SHA from GitHub:", error));
}
