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
let app, db, auth;
try {
  app = firebase.initializeApp(firebaseConfig);
  db = firebase.firestore();
  auth = firebase.auth();
  console.log("Firebase initialized successfully");
} catch (error) {
  console.error("Error initializing Firebase:", error);
  alert("Error initializing Firebase: " + error.message);
}

// Authentication State and Functions
let currentUser = null;

// Initialize auth state listener
auth.onAuthStateChanged((user) => {
  currentUser = user;
  updateAuthUI(user);
});

// Update authentication UI
function updateAuthUI(user) {
  const authUserInfo = document.getElementById('auth-user-info');
  const loginBtn = document.getElementById('login-btn');
  const logoutBtn = document.getElementById('logout-btn');
  
  if (user) {
    // User is signed in
    const displayName = user.displayName || user.email;
    authUserInfo.textContent = `✅ ${displayName}`;
    authUserInfo.title = `Logged in as: ${displayName}`;
    loginBtn.style.display = 'none';
    logoutBtn.style.display = 'flex';
  } else {
    // User is signed out
    authUserInfo.textContent = '👁️ Read-only';
    authUserInfo.title = 'Login to edit content';
    loginBtn.style.display = 'flex';
    logoutBtn.style.display = 'none';
  }
}

// Show login modal
function showLoginModal() {
  document.getElementById('login-modal').style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

// Hide login modal
function hideLoginModal() {
  document.getElementById('login-modal').style.display = 'none';
  document.body.style.overflow = 'auto';
  clearAuthMessage();
}

// Switch between login and register tabs
function switchTab(tabName) {
  const tabs = document.querySelectorAll('.login-tab');
  const contents = document.querySelectorAll('.login-tab-content');
  
  tabs.forEach(tab => {
    tab.classList.toggle('active', tab.dataset.tab === tabName);
  });
  
  contents.forEach(content => {
    content.classList.toggle('active', content.id === `${tabName}-tab-content`);
  });
  
  clearAuthMessage();
}

// Show authentication message
function showAuthMessage(message, type) {
  const messageEl = document.getElementById('auth-message');
  messageEl.textContent = message;
  messageEl.className = `auth-message ${type}`;
  messageEl.style.display = 'block';
}

// Clear authentication message
function clearAuthMessage() {
  const messageEl = document.getElementById('auth-message');
  messageEl.style.display = 'none';
}

// Handle user registration
async function handleRegister(event) {
  event.preventDefault();
  
  const name = document.getElementById('register-name').value;
  const studentId = document.getElementById('register-student-id').value;
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;
  const confirmPassword = document.getElementById('register-confirm-password').value;
  
  // Validate passwords match
  if (password !== confirmPassword) {
    showAuthMessage('Passwords do not match!', 'error');
    return;
  }
  
  try {
    // Create user account
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;
    
    // Update user profile with display name
    await user.updateProfile({
      displayName: `${name} (${studentId})`
    });
    
    // Store additional user data in Firestore
    await db.collection('users').doc(user.uid).set({
      name: name,
      studentId: studentId,
      email: email,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    showAuthMessage('Registration successful! You can now edit content.', 'success');
    
    setTimeout(() => {
      hideLoginModal();
    }, 2000);
    
  } catch (error) {
    console.error('Registration error:', error);
    showAuthMessage(error.message, 'error');
  }
}

// Handle user login
async function handleLogin(event) {
  event.preventDefault();
  
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  
  try {
    await auth.signInWithEmailAndPassword(email, password);
    showAuthMessage('Login successful!', 'success');
    
    setTimeout(() => {
      hideLoginModal();
    }, 1500);
    
  } catch (error) {
    console.error('Login error:', error);
    showAuthMessage(error.message, 'error');
  }
}

// Handle user logout
async function handleLogout() {
  try {
    await auth.signOut();
    alert('You have been logged out successfully.');
  } catch (error) {
    console.error('Logout error:', error);
    alert('Error logging out: ' + error.message);
  }
}

// Check if user is authenticated
function isUserAuthenticated() {
  return currentUser !== null;
}

// Get user display name for editing
function getUserDisplayName() {
  if (currentUser) {
    return currentUser.displayName || currentUser.email;
  }
  return null;
}

// Fetch data from Firestore
async function fetchData() {
  try {
    console.log("Attempting to fetch data from Firebase...");
    const docRef = db.collection("schedule").doc("data");
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      let data = docSnap.data();
      console.log("Successfully fetched data:", data);
      
      // Check if data is properly structured
      if (typeof data === 'string') {
        try {
          // If data is a string, try to parse it as JSON
          data = JSON.parse(data);
          console.log("Parsed stringified data:", data);
        } catch (parseError) {
          console.error("Failed to parse data as JSON:", parseError);
          alert("Data format error in Firebase. Please check the database structure.");
          return;
        }
      }
      
      loadData(data);
    } else {
      console.log("No such document!");
      alert("No data found in Firebase. Please check the database.");
      
      // Load default content for news
      document.getElementById('news-content').innerHTML = 
        '<marquee behavior="scroll" direction="left" scrollamount="10" onmouseover="this.stop();" onmouseout="this.start();">No Updates Available.</marquee>';
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    alert("Error connecting to Firebase: " + error.message);
    
    // Load default content for news on error
    document.getElementById('news-content').innerHTML = 
      '<marquee behavior="scroll" direction="left" scrollamount="10" onmouseover="this.stop();" onmouseout="this.start();">Error loading updates.</marquee>';
  }
}

// Load saved data into the page
function loadData(data) {
  console.log("Loading data into page elements...", data);
  
  ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'tasks', 'bus', 'news'].forEach(section => {
    try {
      if (section === 'bus') {
        if (data.bus) {
          document.getElementById('bus-on-from-campus').innerHTML = data.bus.onfromCampus || '';
          document.getElementById('bus-on-to-campus').innerHTML = data.bus.ontoCampus || '';
          document.getElementById('bus-off-from-campus').innerHTML = data.bus.offfromCampus || '';
          document.getElementById('bus-off-to-campus').innerHTML = data.bus.offtoCampus || '';
        }
      } else if (section === 'news') {
        // Load news content into marquee
        if (data.news && data.news.content) {
          console.log("Loading news content:", data.news.content);
          document.getElementById('news-content').innerHTML = data.news.content;
        } else {
          console.log("No news content found or invalid news structure");
        }
      } else {
        if (data[section] && data[section].content) {
          document.getElementById(`${section}-content`).innerHTML = data[section].content;
        }
      }

      if (data[section] && data[section].lastEditedBy) {
        const editorElement = document.getElementById(`${section}-editor`);
        if (editorElement) {
          editorElement.textContent = `Last edited by: ${data[section].lastEditedBy}`;
        }
      }
    } catch (error) {
      console.error(`Error loading section ${section}:`, error);
    }
  });
  
  // Store the data for live info board
  storeScheduleData(data);
}

// Enable editing for a section
function enableEditing(section) {
  // Check if user is authenticated
  if (!isUserAuthenticated()) {
    alert("Please login to edit content. Only registered users can make changes.");
    showLoginModal();
    return;
  }

  const userDisplayName = getUserDisplayName();
  
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
        lastEditedBy: userDisplayName
      };

      await saveDataToFirestore(section, updatedData);
      fetchData();
      saveBtn.remove();
    };
    document.getElementById('bus-content').appendChild(saveBtn);
  } else if (section === 'news') {
    // Create modal overlay for news editing
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'news-edit-modal-overlay';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'news-edit-modal';
    
    const modalHeader = document.createElement('div');
    modalHeader.className = 'news-edit-header';
    modalHeader.innerHTML = '<h3>📢 Edit Latest Updates</h3><p>Add or modify news items. Use emojis and spaces for better presentation.</p>';
    
    const textarea = document.createElement('textarea');
    textarea.className = 'news-edit-textarea';
    textarea.value = document.getElementById('news-content').innerHTML.replace(/<marquee[^>]*>|<\/marquee>/g, '').trim();
    textarea.placeholder = 'Example: 🎉 Puja Vacation Going On          📚 Mid-term exams on Oct 20-25          🚌 New bus schedule available';
    
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'news-edit-buttons';
    
    const saveBtn = document.createElement('button');
    saveBtn.className = 'news-save-btn';
    saveBtn.innerHTML = '💾 Save Changes';
    saveBtn.onclick = async () => {
      const marqueeContent = `<marquee behavior="scroll" direction="left" scrollamount="10" onmouseover="this.stop();" onmouseout="this.start();">${textarea.value}</marquee>`;
      
      const updatedData = {
        content: marqueeContent,
        lastEditedBy: userDisplayName
      };

      await saveDataToFirestore(section, updatedData);
      fetchData();
      document.body.removeChild(modalOverlay);
    };
    
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'news-cancel-btn';
    cancelBtn.innerHTML = '❌ Cancel';
    cancelBtn.onclick = () => {
      document.body.removeChild(modalOverlay);
    };
    
    buttonContainer.appendChild(saveBtn);
    buttonContainer.appendChild(cancelBtn);
    
    modalContent.appendChild(modalHeader);
    modalContent.appendChild(textarea);
    modalContent.appendChild(buttonContainer);
    modalOverlay.appendChild(modalContent);
    
    document.body.appendChild(modalOverlay);
    textarea.focus();
    
    // Close modal when clicking outside
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        document.body.removeChild(modalOverlay);
      }
    });
  } else {
    const element = document.getElementById(`${section}-content`);
    element.contentEditable = true;
    element.focus();

    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Save Changes';
    saveBtn.onclick = async () => {
      const updatedData = {
        content: element.innerHTML,
        lastEditedBy: userDisplayName
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
    const docRef = db.collection("schedule").doc("data");
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      const currentData = docSnap.data();
      currentData[section] = updatedData;
      await docRef.set(currentData);
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

// Resource popup logic
const mainResourceBtn = document.getElementById('main-resource-btn');
const resourcePopup = document.getElementById('resource-popup');

function showResourcePopup() {
  resourcePopup.classList.add('show');
}

function hideResourcePopup() {
  resourcePopup.classList.remove('show');
}

mainResourceBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  if (resourcePopup.classList.contains('show')) {
    hideResourcePopup();
  } else {
    showResourcePopup();
  }
});

// Optional: Show on hover
mainResourceBtn.addEventListener('mouseenter', showResourcePopup);
mainResourceBtn.addEventListener('mouseleave', () => {
  setTimeout(() => {
    if (!resourcePopup.matches(':hover')) hideResourcePopup();
  }, 200);
});
resourcePopup.addEventListener('mouseleave', hideResourcePopup);

// Hide popup when clicking outside
document.addEventListener('click', (e) => {
    if (!resourcePopup.contains(e.target) && e.target !== mainResourceBtn) {
        hideResourcePopup();
    }
});
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
        timeElement.textContent = 'Thinking...';
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

// Authentication Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Login button
    document.getElementById('login-btn').addEventListener('click', showLoginModal);
    
    // Logout button
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
    
    // Close modal button
    document.getElementById('close-login-modal').addEventListener('click', hideLoginModal);
    
    // Tab switching
    document.querySelectorAll('.login-tab').forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });
    
    // Form submissions
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('register-form').addEventListener('submit', handleRegister);
    
    // Close modal when clicking outside
    document.getElementById('login-modal').addEventListener('click', (e) => {
        if (e.target.id === 'login-modal') {
            hideLoginModal();
        }
    });
    
    // Prevent form submission on enter key for password confirmation
    document.getElementById('register-confirm-password').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            document.getElementById('register-form').dispatchEvent(new Event('submit'));
        }
    });
});

// Make global access to enableEditing and showDay
window.enableEditing = enableEditing;
window.showDay = showDay;
