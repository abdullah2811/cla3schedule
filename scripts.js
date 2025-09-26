import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-firestore.js";

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
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Fetch data from Firestore
async function fetchData() {
  try {
    const docRef = doc(db, "schedule", "data");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log("Fetched data:", data);
      loadData(data);
    } else {
      console.log("No such document!");
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

// Load saved data into the page
function loadData(data) {
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
  
  // Store the data for live info board
  storeScheduleData(data);
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

      await saveDataToFirestore(section, updatedData);
      fetchData();
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

      await saveDataToFirestore(section, updatedData);
      fetchData();
      saveBtn.remove();
    };
    element.parentNode.appendChild(saveBtn);
  }
}

// Save data to Firestore
async function saveDataToFirestore(section, updatedData) {
  try {
    const docRef = doc(db, "schedule", "data");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const currentData = docSnap.data();
      currentData[section] = updatedData;
      await setDoc(docRef, currentData);
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

// Auto-select current day based on today's date
function setCurrentDayAsDefault() {
  const now = new Date();
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const currentDay = dayNames[now.getDay()];
  
  // Map of available days in your schedule (excluding Thursday and Friday as they're off days)
  const availableDays = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday'];
  
  // Check if current day is available in schedule
  if (availableDays.includes(currentDay)) {
    console.log(`Setting default day to: ${currentDay}`);
    showDay(currentDay);
  } else {
    // If it's Thursday or Friday (off days), default to next available day
    if (currentDay === 'thursday') {
      showDay('saturday'); // Next day with classes
      console.log('Today is Thursday (off day), defaulting to Saturday');
    } else if (currentDay === 'friday') {
      showDay('saturday'); // Next day with classes
      console.log('Today is Friday (off day), defaulting to Saturday');
    } else {
      // Fallback to Saturday if something goes wrong
      showDay('saturday');
      console.log('Fallback: defaulting to Saturday');
    }
  }
}

// Dark mode toggle
const darkModeToggle = document.getElementById('dark-mode-toggle');

// Check if dark mode preference exists, if not set default to dark mode
const darkModePreference = localStorage.getItem('dark-mode');
if (darkModePreference === null || darkModePreference === 'enabled') {
    document.body.classList.add('dark-mode');
    localStorage.setItem('dark-mode', 'enabled');
}

// Add event listener to the toggle button
darkModeToggle.addEventListener('click', () => {
    const isDarkMode = document.body.classList.toggle('dark-mode');
    // Save the user's preference in localStorage
    if (isDarkMode) {
        localStorage.setItem('dark-mode', 'enabled');
    } else {
        localStorage.setItem('dark-mode', 'disabled');
    }
});

let scheduleData = {};

// Update current time and date
function updateDateTime() {
    const now = new Date();
    
    // Check if elements exist
    const timeElement = document.getElementById('current-time');
    const dateElement = document.getElementById('current-date');
    
    if (!timeElement || !dateElement) {
        console.log('Time/date elements not found');
        return;
    }
    
    // Format time
    const timeOptions = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    };
    const currentTime = now.toLocaleTimeString('en-US', timeOptions);
    
    // Format date as "26 September 2025" and day as "Friday"
    const day = now.getDate();
    const month = now.toLocaleDateString('en-US', { month: 'long' });
    const year = now.getFullYear();
    const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' });
    
    const formattedDate = `${day} ${month} ${year}`;
    const formattedDay = dayOfWeek;
    
    timeElement.textContent = currentTime;
    dateElement.innerHTML = `${formattedDate}<br>${formattedDay}`;
}

// Get current day schedule
function getCurrentDaySchedule() {
    const now = new Date();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDay = dayNames[now.getDay()];
    
    // Check if it's Thursday or Friday (off days)
    if (currentDay === 'thursday' || currentDay === 'friday') {
        return null;
    }
    
    return scheduleData[currentDay];
}

// Parse time string to minutes for comparison
function timeToMinutes(timeStr) {
    const [time, period] = timeStr.split(/\s+/);
    let [hours, minutes] = time.split(/[:.]/);
    hours = parseInt(hours);
    minutes = parseInt(minutes) || 0;
    
    if (period && period.toUpperCase() === 'PM' && hours !== 12) {
        hours += 12;
    } else if (period && period.toUpperCase() === 'AM' && hours === 12) {
        hours = 0;
    }
    
    return hours * 60 + minutes;
}

// Get next class
function getNextClass() {
    // Check if elements exist first
    const timeElement = document.getElementById('next-class-time');
    const subjectElement = document.getElementById('next-class-subject');
    
    if (!timeElement || !subjectElement) {
        console.log('Next class elements not found');
        return;
    }
    
    const currentDaySchedule = getCurrentDaySchedule();
    
    if (!currentDaySchedule) {
        timeElement.textContent = 'Off Day';
        subjectElement.textContent = 'Thu/Fri - No Classes';
        return;
    }
    
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    // Parse the HTML table to extract class information
    const parser = new DOMParser();
    const doc = parser.parseFromString(currentDaySchedule.content, 'text/html');
    const rows = Array.from(doc.querySelectorAll('tr')).slice(1); // Skip header row
    
    let nextClass = null;
    
    for (const row of rows) {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 3) {
            const timeRange = cells[0].textContent.trim();
            const subject = cells[1].textContent.trim();
            const room = cells[2].textContent.trim();
            
            // Extract start time from range (e.g., "09.00-09.50" -> "09.00")
            const startTime = timeRange.split('-')[0].trim();
            
            // Convert to standard time format for parsing
            const formattedTime = startTime.replace('.', ':');
            let classStartMinutes;
            
            // Handle time format (assuming 24-hour format)
            const timeParts = formattedTime.split(':');
            const hours = parseInt(timeParts[0]);
            const minutes = parseInt(timeParts[1]);
            
            classStartMinutes = hours * 60 + minutes;
            
            // If class hasn't started yet, it's our next class
            if (classStartMinutes > currentMinutes) {
                nextClass = {
                    time: timeRange,
                    subject: subject,
                    room: room,
                    startMinutes: classStartMinutes
                };
                break;
            }
        }
    }
    
    if (nextClass) {
        const timeUntil = nextClass.startMinutes - currentMinutes;
        
        if (timeUntil <= 60) {
            timeElement.textContent = `${timeUntil}m`;
        } else {
            const hoursUntil = Math.floor(timeUntil / 60);
            const minutesUntil = timeUntil % 60;
            timeElement.textContent = `${hoursUntil}h ${minutesUntil}m`;
        }
        
        subjectElement.textContent = `${nextClass.subject} • ${nextClass.room}`;
    } else {
        timeElement.textContent = 'No More';
        subjectElement.textContent = 'Classes finished today';
    }
}

// Get next buses
function getNextBuses() {
    // Check if elements exist first
    const toCampusElement = document.getElementById('next-bus-to');
    const fromCampusElement = document.getElementById('next-bus-from');
    
    if (!toCampusElement || !fromCampusElement) {
        console.log('Bus elements not found');
        return;
    }
    
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDay = dayNames[now.getDay()];
    
    const isOffDay = currentDay === 'thursday' || currentDay === 'friday';
    const busSchedule = scheduleData.bus;
    
    if (!busSchedule) {
        toCampusElement.textContent = 'Loading...';
        fromCampusElement.textContent = 'Loading...';
        return;
    }
    
    // Choose appropriate schedule based on day
    const toCampusSchedule = isOffDay ? busSchedule.offtoCampus : busSchedule.ontoCampus;
    const fromCampusSchedule = isOffDay ? busSchedule.offfromCampus : busSchedule.onfromCampus;
    
    // Parse bus times and find next buses
    const nextToCampus = findNextBusCompact(toCampusSchedule, currentMinutes);
    const nextFromCampus = findNextBusCompact(fromCampusSchedule, currentMinutes);
    
    // Format the display
    if (nextToCampus) {
        toCampusElement.textContent = `To Campus: ${nextToCampus}`;
    } else {
        toCampusElement.textContent = 'To Campus: No more buses today';
    }
    
    if (nextFromCampus) {
        fromCampusElement.textContent = `From Campus: ${nextFromCampus}`;
    } else {
        fromCampusElement.textContent = 'From Campus: No more buses today';
    }
}

function findNextBusCompact(scheduleHtml, currentMinutes) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(scheduleHtml, 'text/html');
    const listItems = doc.querySelectorAll('li');
    
    for (const item of listItems) {
        const timeText = item.textContent.trim();
        const busMinutes = parseBusTime(timeText);
        
        if (busMinutes > currentMinutes) {
            const timeUntil = busMinutes - currentMinutes;
            if (timeUntil <= 60) {
                return `${timeText} (${timeUntil}m)`;
            } else {
                return timeText;
            }
        }
    }
    
    return null;
}

function findNextBus(scheduleHtml, currentMinutes) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(scheduleHtml, 'text/html');
    const listItems = doc.querySelectorAll('li');
    
    for (const item of listItems) {
        const timeText = item.textContent.trim();
        const busMinutes = parseBusTime(timeText);
        
        if (busMinutes > currentMinutes) {
            const timeUntil = busMinutes - currentMinutes;
            if (timeUntil <= 60) {
                return `${timeText} (${timeUntil}m)`;
            } else {
                const hoursUntil = Math.floor(timeUntil / 60);
                const minutesUntil = timeUntil % 60;
                return `${timeText} (${hoursUntil}h ${minutesUntil}m)`;
            }
        }
    }
    
    return null;
}

function parseBusTime(timeStr) {
    // Handle formats like "08.00 AM", "02.30 PM"
    const [time, period] = timeStr.split(/\s+/);
    const [hours, minutes] = time.split(/[:.]/);
    let hour24 = parseInt(hours);
    const min = parseInt(minutes) || 0;
    
    if (period && period.toUpperCase() === 'PM' && hour24 !== 12) {
        hour24 += 12;
    } else if (period && period.toUpperCase() === 'AM' && hour24 === 12) {
        hour24 = 0;
    }
    
    return hour24 * 60 + min;
}

// Store schedule data when loaded
function storeScheduleData(data) {
    console.log('Storing schedule data:', data);
    scheduleData = data;
    // Set current day as default after data is loaded
    setCurrentDayAsDefault();
    // Wait a moment for DOM to be ready, then update info
    setTimeout(() => {
        console.log('Updating live info with stored data');
        updateLiveInfo();
    }, 100);
}

// Update all live information
function updateLiveInfo() {
    // Only update if we have schedule data and elements exist
    if (Object.keys(scheduleData).length > 0) {
        updateDateTime();
        getNextClass();
        getNextBuses();
    } else {
        console.log('Schedule data not ready yet');
    }
}

// Initialize live updates
function initializeLiveBoard() {
    console.log('Initializing live widget...');
    
    // Check if all required elements exist
    const requiredElements = [
        'current-time', 'current-date', 
        'next-class-time', 'next-class-subject',
        'next-bus-to', 'next-bus-from'
    ];
    
    const missingElements = requiredElements.filter(id => !document.getElementById(id));
    
    if (missingElements.length > 0) {
        console.error('Missing elements:', missingElements);
        console.log('Make sure you have added the HTML for the info widget');
        return;
    }
    
    updateLiveInfo();
    
    // Update time every second
    setInterval(updateDateTime, 1000);
    
    // Update class and bus info every minute
    setInterval(() => {
        if (Object.keys(scheduleData).length > 0) {
            getNextClass();
            getNextBuses();
        }
    }, 60000);
    
    console.log('Live widget initialized successfully');
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, waiting for data...');
    
    // Show immediate feedback that the script is loading
    const timeElement = document.getElementById('current-time');
    if (timeElement) {
        timeElement.textContent = 'Loading...';
        console.log('Found time element, showing loading message');
    } else {
        console.error('Time element not found! Make sure the HTML is properly added.');
    }
    
    // Wait a moment for data to load, then initialize
    setTimeout(() => {
        console.log('Attempting to initialize live board...');
        initializeLiveBoard();
    }, 2000); // Increased timeout to ensure data is loaded
});

// Load everything on page load
fetchData();

// Make global access to enableEditing and showDay
window.enableEditing = enableEditing;
window.showDay = showDay;
