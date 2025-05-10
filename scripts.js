//  Import Firebase (if using npm, otherwise include Firebase scripts in your HTML)
// import { initializeApp } from "firebase/app";
// import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

// Firebase configuration (replace with your Firebase config object)
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
const app = initializeApp(firebaseConfig);
const db = getFirestore(app); // Initialize Firestore

// Fetch data from Firestore
async function fetchData() {
  try {
    const docRef = doc(db, "schedule", "data"); // "schedule" is the collection, "data" is the document
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      data = docSnap.data(); // Assign the fetched data to the global `data` variable
      loadData(); // Populate the page with the fetched data
    } else {
      console.log("No such document!");
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

// Load saved data into the page
function loadData() {
  ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'tasks', 'bus'].forEach(section => {
    if (section === 'bus') {
      document.getElementById('bus-on-from-campus').innerHTML = data.bus.onFromCampus;
      document.getElementById('bus-on-to-campus').innerHTML = data.bus.onToCampus;
      document.getElementById('bus-off-from-campus').innerHTML = data.bus.offFromCampus;
      document.getElementById('bus-off-to-campus').innerHTML = data.bus.offToCampus;
    } else {
      document.getElementById(`${section}-content`).innerHTML = data[section].content;
    }

    document.getElementById(`${section}-editor`).textContent =
      data[section].lastEditedBy ? `Last edited by: ${data[section].lastEditedBy}` : '';
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
      data.bus = {
        onFromCampus: onFromCampusElement.innerHTML,
        onToCampus: onToCampusElement.innerHTML,
        offFromCampus: offFromCampusElement.innerHTML,
        offToCampus: offToCampusElement.innerHTML,
        lastEditedBy: `${name} (ID: ${studentId})`
      };

      await saveDataToFirestore(); // Save changes to Firestore
      loadData(); // Reload the data
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
      data[section] = {
        content: element.innerHTML,
        lastEditedBy: `${name} (ID: ${studentId})`
      };

      await saveDataToFirestore(); // Save changes to Firestore
      loadData(); // Reload the data
      saveBtn.remove();
    };
    element.parentNode.appendChild(saveBtn);
  }
}

// Save data to Firestore
async function saveDataToFirestore() {
  try {
    await setDoc(doc(db, "schedule", "data"), data); // Save the updated data to Firestore
    alert("Changes saved successfully!");
  } catch (error) {
    console.error("Error saving data:", error);
  }
}

// Fetch data when the page loads
fetchData();
