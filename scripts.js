// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDHAFOwKHAZR9lGOaGtbPEOIa3pLqi1HnM",
  authDomain: "cla3schedule.firebaseapp.com",
  projectId: "cla3schedule",
  storageBucket: "cla3schedule.firebasestorage.app",
  messagingSenderId: "813133654179",
  appId: "1:813133654179:web:c45dd59b6a26788f203716",
  measurementId: "G-SB0V98NY8H"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore(); // Initialize Firestore

// Fetch data from Firestore
async function fetchData() {
  try {
    const docRef = db.collection("schedule").doc("data"); // "schedule" is the collection, "data" is the document
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      const data = docSnap.data(); // Assign the fetched data to a local variable
      console.log("Fetched data:", data); // Debugging line
      loadData(data); // Populate the page with the fetched data
    } else {
      console.log("No such document!");
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

// Load saved data into the page
function loadData(data) {
  console.log("Loading data:", data); // Debugging line
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

// Show the selected day's schedule
function showDay(day) {
  // Hide all day schedules
  document.querySelectorAll('.day-schedule').forEach(el => {
    el.classList.remove('active');
  });

  // Show the selected day
  document.getElementById(day).classList.add('active');

  // Update active button
  document.querySelectorAll('.day-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.textContent.toLowerCase() === day) btn.classList.add('active');
  });
}

// Enable editing for a section
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
    saveBtn.onclick = async () => {
      const updatedData = {
        onfromCampus: onFromCampusElement.innerHTML,
        ontoCampus: onToCampusElement.innerHTML,
        offfromCampus: offFromCampusElement.innerHTML,
        offtoCampus: offToCampusElement.innerHTML,
        lastEditedBy: `${name} (ID: ${studentId})`
      };

      await saveDataToFirestore(section, updatedData); // Save changes to Firestore
      fetchData(); // Reload the data
      saveBtn.remove();
    };
    document.getElementById('bus-content').appendChild(saveBtn);
  } else {
    const element = document.getElementById(`${section}-content`);
    element.contentEditable = true;
    element.focus();

    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Save Changes';
    saveBtn.onclick = async () => {
      const updatedData = {
        content: element.innerHTML,
        lastEditedBy: `${name} (ID: ${studentId})`
      };

      await saveDataToFirestore(section, updatedData); // Save changes to Firestore
      fetchData(); // Reload the data
      saveBtn.remove();
    };
    element.parentNode.appendChild(saveBtn);
  }
}

// Save data to Firestore
async function saveDataToFirestore(section, updatedData) {
  try {
    const docRef = db.collection("schedule").doc("data");
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      const currentData = docSnap.data();
      currentData[section] = updatedData; // Update the specific section
      await docRef.set(currentData); // Save the updated data to Firestore
      alert("Changes saved successfully!");
    } else {
      console.log("No such document to update!");
    }
  } catch (error) {
    console.error("Error saving data:", error);
  }
}

// Show the selected day's schedule
function showDay(day) {
  // Hide all day schedules
  document.querySelectorAll('.day-schedule').forEach(el => {
    el.classList.remove('active');
  });

  // Show the selected day
  document.getElementById(day).classList.add('active');

  // Update active button
  document.querySelectorAll('.day-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.textContent.toLowerCase() === day) btn.classList.add('active');
  });
}

// Fetch data when the page loads
fetchData();
