// Fetch data from the GitHub raw URL
fetch("https://raw.githubusercontent.com/abdullah2811/cla3schedule.github.io/refs/heads/main/data.json")
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
        onFromCampus: onFromCampusElement.innerHTML,
        onToCampus: onToCampusElement.innerHTML,
        offFromCampus: offFromCampusElement.innerHTML,
        offToCampus: offToCampusElement.innerHTML,
        lastEditedBy: `${name} (ID: ${studentId})`
      };
      localStorage.setItem('bus', JSON.stringify(data.bus));
      loadData();
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
      localStorage.setItem(section, JSON.stringify(data[section]));
      loadData();
      saveBtn.remove();
    };
    element.parentNode.appendChild(saveBtn);
  }
}