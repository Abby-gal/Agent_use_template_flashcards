// Convert a time such as 09:30 into minutes after midnight.
function timeToMinutes(time) {
    let parts = time.split(":");
    let hours = Number(parts[0]);
    let minutes = Number(parts[1]);
    return (hours * 60) + minutes;
}

// Add a valid activity to local storage and reset the form.
function handleActivitySubmit(event) {
    event.preventDefault();

    const nameInput = document.getElementById("activity-name");
    const categoryInput = document.getElementById("activity-category");
    const dateInput = document.getElementById("activity-date");
    const startInput = document.getElementById("planned-start");
    const endInput = document.getElementById("planned-end");
    const message = document.getElementById("activity-message");

    const name = nameInput.value.trim();
    const category = categoryInput.value;
    const date = dateInput.value;
    const plannedStart = startInput.value;
    const plannedEnd = endInput.value;

    if (name === "" || category === "" || date === "" || plannedStart === "" || plannedEnd === "") {
        message.textContent = "Please fill in every field.";
        return;
    }

    if (timeToMinutes(plannedEnd) <= timeToMinutes(plannedStart)) {
        message.textContent = "The planned end time must be after the planned start time.";
        return;
    }

    let activities = JSON.parse(localStorage.getItem("lifeBalanceActivities") || "[]");
    activities.push({
        name: name,
        category: category,
        date: date,
        plannedStart: plannedStart,
        plannedEnd: plannedEnd
    });
    localStorage.setItem("lifeBalanceActivities", JSON.stringify(activities));

    message.textContent = "Activity added for " + date + ".";
    document.getElementById("activity-form").reset();
}

// Start the planner application after the page has loaded.
function startPlanner() {
    const activityForm = document.getElementById("activity-form");
    activityForm.addEventListener("submit", handleActivitySubmit);
}

document.addEventListener("DOMContentLoaded", startPlanner);
