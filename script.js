// Convert a time such as 09:30 into minutes after midnight.
function timeToMinutes(time) {
    let parts = time.split(":");
    let hours = Number(parts[0]);
    let minutes = Number(parts[1]);
    return (hours * 60) + minutes;
}

// Convert a YYYY-MM-DD date into a Date in the local time zone.
function dateFromString(dateString) {
    const parts = dateString.split("-");
    return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
}

// Format a date as YYYY-MM-DD for comparison with activities.
function dateToString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return year + "-" + month + "-" + day;
}

// Find Monday of the week selected in an input such as 2026-W47.
function getMondayForWeek(weekValue) {
    const parts = weekValue.split("-W");
    const year = Number(parts[0]);
    const week = Number(parts[1]);
    const januaryFourth = new Date(year, 0, 4);
    const januaryFourthDay = januaryFourth.getDay() || 7;
    const monday = new Date(januaryFourth);
    monday.setDate(januaryFourth.getDate() - januaryFourthDay + 1 + ((week - 1) * 7));
    return monday;
}

// Return today's date in the ISO year and week format.
function getCurrentWeekValue() {
    const today = new Date();
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const januaryFourth = new Date(date.getFullYear(), 0, 4);
    const januaryFourthDay = januaryFourth.getDay() || 7;
    date.setDate(date.getDate() - januaryFourthDay + 1);
    const weekNumber = 1 + Math.round((date - januaryFourth) / 86400000 / 7);
    return date.getFullYear() + "-W" + String(weekNumber).padStart(2, "0");
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
    renderTimetable();
}

// Remove an activity from local storage using its position in the saved list.
function deleteActivity(activityIndex) {
    let activities = JSON.parse(localStorage.getItem("lifeBalanceActivities") || "[]");
    activities.splice(activityIndex, 1);
    localStorage.setItem("lifeBalanceActivities", JSON.stringify(activities));
    renderTimetable();
}

// Render one day's activities inside the weekly timetable.
function renderDay(day, monday, timetable) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + day);
    const dateString = dateToString(date);

    const dayElement = document.createElement("div");
    dayElement.className = "timetable-day";

    const heading = document.createElement("h3");
    heading.textContent = date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric"
    });
    dayElement.appendChild(heading);

    const activities = JSON.parse(localStorage.getItem("lifeBalanceActivities") || "[]");
    const dayActivities = activities.filter(function(activity) {
        return activity.date === dateString;
    });

    dayActivities.sort(function(firstActivity, secondActivity) {
        return timeToMinutes(firstActivity.plannedStart) - timeToMinutes(secondActivity.plannedStart);
    });

    if (dayActivities.length === 0) {
        const emptyText = document.createElement("p");
        emptyText.className = "empty-slot";
        emptyText.textContent = "No activities";
        dayElement.appendChild(emptyText);
    }

    dayActivities.forEach(function(activity) {
        const activityElement = document.createElement("div");
        activityElement.className = "activity-item " + activity.category;

        const categoryLabel = activity.category.charAt(0).toUpperCase() + activity.category.slice(1);
        const activityText = document.createElement("span");
        activityText.textContent = activity.plannedStart + "-" + activity.plannedEnd + " " +
            activity.name + " (" + categoryLabel + ")";

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "delete-activity";
        deleteButton.textContent = "Delete";

        const activityIndex = activities.indexOf(activity);
        deleteButton.addEventListener("click", function() {
            deleteActivity(activityIndex);
        });

        activityElement.appendChild(activityText);
        activityElement.appendChild(deleteButton);
        dayElement.appendChild(activityElement);
    });

    timetable.appendChild(dayElement);
}

// Show the activities belonging to the selected week.
function renderTimetable() {
    const selectedWeek = document.getElementById("selected-week");
    const timetable = document.getElementById("timetable");
    timetable.textContent = "";

    if (selectedWeek.value === "") {
        timetable.textContent = "Select a week to see activities.";
        return;
    }

    const monday = getMondayForWeek(selectedWeek.value);

    for (let day = 0; day < 7; day++) {
        renderDay(day, monday, timetable);
    }
}

// Start the planner application after the page has loaded.
function startPlanner() {
    const activityForm = document.getElementById("activity-form");
    const selectedWeek = document.getElementById("selected-week");

    if (selectedWeek.value === "") {
        selectedWeek.value = getCurrentWeekValue();
    }

    activityForm.addEventListener("submit", handleActivitySubmit);
    selectedWeek.addEventListener("change", renderTimetable);
    renderTimetable();
}

document.addEventListener("DOMContentLoaded", startPlanner);
