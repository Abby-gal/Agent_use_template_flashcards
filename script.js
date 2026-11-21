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

let additionalActivityDates = [];

// Add the date picker value to the optional dates list.
function addAdditionalDate() {
    const dateInput = document.getElementById("additional-date");
    const date = dateInput.value;
    if (date === "" || additionalActivityDates.includes(date)) {
        return;
    }

    additionalActivityDates.push(date);
    dateInput.value = "";
    renderAdditionalDates();
}

// Remove a date from the optional dates list.
function removeAdditionalDate(dateToRemove) {
    additionalActivityDates = additionalActivityDates.filter(function(date) {
        return date !== dateToRemove;
    });
    renderAdditionalDates();
}

// Show the selected optional dates with a remove button for each one.
function renderAdditionalDates() {
    const dateList = document.getElementById("additional-date-list");
    dateList.textContent = "";
    additionalActivityDates.forEach(function(date) {
        const item = document.createElement("li");
        item.textContent = dateFromString(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric"
        });
        const removeButton = document.createElement("button");
        removeButton.type = "button";
        removeButton.textContent = "Remove";
        removeButton.setAttribute("aria-label", "Remove " + date);
        removeButton.addEventListener("click", function() {
            removeAdditionalDate(date);
        });
        item.appendChild(removeButton);
        dateList.appendChild(item);
    });
}

// Load saved weekly targets into the target fields.
function loadWeeklyTargets() {
    const targets = JSON.parse(localStorage.getItem("lifeBalanceTargets") || "{}");

    if (targets.workLimit !== undefined) {
        document.getElementById("work-limit").value = targets.workLimit;
    }
    if (targets.responsibilityLimit !== undefined) {
        document.getElementById("responsibility-limit").value = targets.responsibilityLimit;
    }
    if (targets.exerciseGoal !== undefined) {
        document.getElementById("exercise-goal").value = targets.exerciseGoal;
    }
    if (targets.restMinimum !== undefined) {
        document.getElementById("rest-minimum").value = targets.restMinimum;
    }
}

// Save the four weekly target values in local storage.
function handleTargetsSubmit(event) {
    event.preventDefault();

    const targets = {
        workLimit: document.getElementById("work-limit").value,
        responsibilityLimit: document.getElementById("responsibility-limit").value,
        exerciseGoal: document.getElementById("exercise-goal").value,
        restMinimum: document.getElementById("rest-minimum").value
    };

    localStorage.setItem("lifeBalanceTargets", JSON.stringify(targets));

    document.getElementById("work-limit").value = targets.workLimit;
    document.getElementById("responsibility-limit").value = targets.responsibilityLimit;
    document.getElementById("exercise-goal").value = targets.exerciseGoal;
    document.getElementById("rest-minimum").value = targets.restMinimum;
    document.getElementById("targets-message").textContent = "Targets saved";
    renderWarnings();
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
    const activityDates = [date];
    additionalActivityDates.forEach(function(additionalDate) {
        if (additionalDate !== date) {
            activityDates.push(additionalDate);
        }
    });
    activityDates.forEach(function(activityDate) {
        activities.push({
            name: name,
            category: category,
            date: activityDate,
            plannedStart: plannedStart,
            plannedEnd: plannedEnd
        });
    });
    localStorage.setItem("lifeBalanceActivities", JSON.stringify(activities));

    // Add the submitted activity details to the recent activities list.
    saveRecentActivity(name, category, plannedStart, plannedEnd);

    message.textContent = "Activity added for " + activityDates.length +
        (activityDates.length === 1 ? " date." : " dates.");
    additionalActivityDates = [];
    document.getElementById("activity-form").reset();
    renderAdditionalDates();
    renderTimetable();
}

// Add the submitted activity details to the recent activities list.
function saveRecentActivity(name, category, plannedStart, plannedEnd) {
    let recentActivities = JSON.parse(localStorage.getItem("lifeBalanceRecentActivities") || "[]");
    const recentActivity = {
        name: name,
        category: category,
        plannedStart: plannedStart,
        plannedEnd: plannedEnd
    };

    recentActivities = recentActivities.filter(function(activity) {
        return activity.name !== name || activity.category !== category ||
            activity.plannedStart !== plannedStart || activity.plannedEnd !== plannedEnd;
    });
    recentActivities.unshift(recentActivity);

    if (recentActivities.length > 10) {
        recentActivities = recentActivities.slice(0, 10);
    }
    localStorage.setItem("lifeBalanceRecentActivities", JSON.stringify(recentActivities));
    renderRecentActivities();
}

// Show saved recent activities in the selection list.
function renderRecentActivities() {
    const recentSelect = document.getElementById("recent-activity");
    const recentActivities = JSON.parse(localStorage.getItem("lifeBalanceRecentActivities") || "[]");

    recentSelect.textContent = "";
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Select recent activity";
    recentSelect.appendChild(defaultOption);

    recentActivities.forEach(function(activity, activityIndex) {
        const option = document.createElement("option");
        option.value = activityIndex;
        option.textContent = activity.name + " - " + activity.category + " (" +
            activity.plannedStart + "-" + activity.plannedEnd + ")";
        recentSelect.appendChild(option);
    });
}

// Fill the activity form with a selected recent activity.
function useRecentActivity() {
    const recentSelect = document.getElementById("recent-activity");
    if (recentSelect.value === "") {
        return;
    }

    const recentActivities = JSON.parse(localStorage.getItem("lifeBalanceRecentActivities") || "[]");
    const activity = recentActivities[Number(recentSelect.value)];

    document.getElementById("activity-name").value = activity.name;
    document.getElementById("activity-category").value = activity.category;
    document.getElementById("planned-start").value = activity.plannedStart;
    document.getElementById("planned-end").value = activity.plannedEnd;
}

// Remove an activity from local storage using its position in the saved list.
function deleteActivity(activityIndex) {
    let activities = JSON.parse(localStorage.getItem("lifeBalanceActivities") || "[]");
    activities.splice(activityIndex, 1);
    localStorage.setItem("lifeBalanceActivities", JSON.stringify(activities));
    renderTimetable();
}

// Save actual start and end times for an activity.
function handleActualSubmit(event, activityIndex) {
    event.preventDefault();

    const actualStart = document.getElementById("actual-start-" + activityIndex).value;
    const actualEnd = document.getElementById("actual-end-" + activityIndex).value;

    if (actualStart === "" || actualEnd === "") {
        document.getElementById("actual-message-" + activityIndex).textContent = "Please enter both actual times.";
        return;
    }

    if (timeToMinutes(actualEnd) <= timeToMinutes(actualStart)) {
        document.getElementById("actual-message-" + activityIndex).textContent = "Actual end time must be after actual start time.";
        return;
    }

    let activities = JSON.parse(localStorage.getItem("lifeBalanceActivities") || "[]");
    activities[activityIndex].actualStart = actualStart;
    activities[activityIndex].actualEnd = actualEnd;
    localStorage.setItem("lifeBalanceActivities", JSON.stringify(activities));

    document.getElementById("actual-message-" + activityIndex).textContent = "Actual times saved.";
    renderHoursSummary();
    renderWarnings();
}

// Add planned and actual minutes for matching activities to a category total.
function addActivityHours(activity, category, firstDate, lastDate, totals) {
    if (activity.category !== category || activity.date < firstDate || activity.date > lastDate) {
        return;
    }

    totals.planned += timeToMinutes(activity.plannedEnd) - timeToMinutes(activity.plannedStart);
    if (activity.actualStart && activity.actualEnd) {
        totals.actual += timeToMinutes(activity.actualEnd) - timeToMinutes(activity.actualStart);
    }
}

// Create the table headings for the weekly hours summary.
function createHoursSummaryTable() {
    const table = document.createElement("table");
    const tableHead = document.createElement("thead");
    const headingRow = document.createElement("tr");

    ["Category", "Planned", "Actual"].forEach(function(label) {
        const heading = document.createElement("th");
        heading.textContent = label;
        heading.scope = "col";
        headingRow.appendChild(heading);
    });
    tableHead.appendChild(headingRow);
    table.appendChild(tableHead);
    return table;
}

// Add one category's planned and actual totals to the summary table.
function addHoursSummaryRow(tableBody, category, activities, firstDate, lastDate) {
    const totals = { planned: 0, actual: 0 };
    activities.forEach(function(activity) {
        addActivityHours(activity, category.value, firstDate, lastDate, totals);
    });

    const row = document.createElement("tr");
    const categoryCell = document.createElement("th");
    categoryCell.scope = "row";
    categoryCell.textContent = category.label;
    row.appendChild(categoryCell);
    [totals.planned, totals.actual].forEach(function(minutes) {
        const cell = document.createElement("td");
        cell.textContent = Number((minutes / 60).toFixed(2)) + " h";
        row.appendChild(cell);
    });
    tableBody.appendChild(row);
}

// Find planned and actual weekly totals for the selected categories.
function getWarningTotals(activities, firstDate, lastDate) {
    const totals = {
        workPlanned: 0,
        workActual: 0,
        responsibilityPlanned: 0,
        responsibilityActual: 0,
        restPlanned: 0
    };

    activities.forEach(function(activity) {
        if (activity.date < firstDate || activity.date > lastDate) {
            return;
        }

        const plannedMinutes = timeToMinutes(activity.plannedEnd) - timeToMinutes(activity.plannedStart);
        let actualMinutes = 0;
        if (activity.actualStart && activity.actualEnd) {
            actualMinutes = timeToMinutes(activity.actualEnd) - timeToMinutes(activity.actualStart);
        }

        if (activity.category === "work") {
            totals.workPlanned += plannedMinutes;
            totals.workActual += actualMinutes;
        }
        if (activity.category === "work" || activity.category === "study" || activity.category === "church") {
            totals.responsibilityPlanned += plannedMinutes;
            totals.responsibilityActual += actualMinutes;
        }
        if (activity.category === "personal") {
            totals.restPlanned += plannedMinutes;
        }
    });

    return totals;
}

// Add a warning message to the warnings section.
function addWarning(warnings, message) {
    const warning = document.createElement("p");
    warning.textContent = message;
    warnings.appendChild(warning);
}

// Show conflicts and weekly target warnings for the selected week.
function renderWarnings() {
    const selectedWeek = document.getElementById("selected-week");
    const warnings = document.getElementById("warnings");
    warnings.textContent = "";

    if (selectedWeek.value === "") {
        addWarning(warnings, "Select a week to see warnings.");
        return;
    }

    const monday = getMondayForWeek(selectedWeek.value);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const firstDate = dateToString(monday);
    const lastDate = dateToString(sunday);
    const activities = JSON.parse(localStorage.getItem("lifeBalanceActivities") || "[]");
    const weekActivities = activities.filter(function(activity) {
        return activity.date >= firstDate && activity.date <= lastDate;
    });

    let warningCount = 0;

    for (let firstIndex = 0; firstIndex < weekActivities.length; firstIndex++) {
        const firstActivity = weekActivities[firstIndex];
        for (let secondIndex = firstIndex + 1; secondIndex < weekActivities.length; secondIndex++) {
            const secondActivity = weekActivities[secondIndex];
            const overlapsDate = firstActivity.date === secondActivity.date;
            const firstStart = timeToMinutes(firstActivity.plannedStart);
            const firstEnd = timeToMinutes(firstActivity.plannedEnd);
            const secondStart = timeToMinutes(secondActivity.plannedStart);
            const secondEnd = timeToMinutes(secondActivity.plannedEnd);
            const overlapsTime = firstStart < secondEnd && secondStart < firstEnd;

            if (overlapsDate && overlapsTime) {
                const firstLabel = firstActivity.category.charAt(0).toUpperCase() + firstActivity.category.slice(1);
                const secondLabel = secondActivity.category.charAt(0).toUpperCase() + secondActivity.category.slice(1);
                addWarning(warnings, firstLabel + " activity overlaps " + secondLabel + " activity on " +
                    dateFromString(firstActivity.date).toLocaleDateString("en-US") + ".");
                warningCount++;
            }
        }
    }

    const targets = JSON.parse(localStorage.getItem("lifeBalanceTargets") || "{}");
    const totals = getWarningTotals(weekActivities, firstDate, lastDate);

    if (targets.workLimit !== undefined && targets.workLimit !== "") {
        const workLimit = Number(targets.workLimit);
        const plannedOver = (totals.workPlanned / 60) - workLimit;
        const actualOver = (totals.workActual / 60) - workLimit;
        if (plannedOver > 0) {
            addWarning(warnings, "Planned work hours are " + plannedOver.toFixed(1) + " hours over the " +
                workLimit + " hour maximum.");
            warningCount++;
        }
        if (actualOver > 0) {
            addWarning(warnings, "Actual work hours are " + actualOver.toFixed(1) + " hours over the " +
                workLimit + " hour maximum.");
            warningCount++;
        }
    }

    if (targets.responsibilityLimit !== undefined && targets.responsibilityLimit !== "") {
        const responsibilityLimit = Number(targets.responsibilityLimit);
        const plannedOver = (totals.responsibilityPlanned / 60) - responsibilityLimit;
        const actualOver = (totals.responsibilityActual / 60) - responsibilityLimit;
        if (plannedOver > 0) {
            addWarning(warnings, "Planned work, study and church hours are " + plannedOver.toFixed(1) +
                " hours over the " + responsibilityLimit + " hour maximum.");
            warningCount++;
        }
        if (actualOver > 0) {
            addWarning(warnings, "Actual work, study and church hours are " + actualOver.toFixed(1) +
                " hours over the " + responsibilityLimit + " hour maximum.");
            warningCount++;
        }
    }

    if (targets.restMinimum !== undefined && targets.restMinimum !== "") {
        const restMinimum = Number(targets.restMinimum);
        const restShort = restMinimum - (totals.restPlanned / 60);
        if (restShort > 0) {
            addWarning(warnings, "Planned personal or rest time is " + restShort.toFixed(1) +
                " hours short of the " + restMinimum + " hour minimum.");
            warningCount++;
        }
    }

    if (warningCount === 0) {
        addWarning(warnings, "No warnings for this week.");
    }
}

// Render planned and recorded hours for each category in the selected week.
function renderHoursSummary() {
    const selectedWeek = document.getElementById("selected-week");
    const summary = document.getElementById("hours-summary");
    summary.textContent = "";
    if (selectedWeek.value === "") {
        summary.textContent = "Select a week to see hours.";
        return;
    }

    const categories = [
        { value: "work", label: "Work" },
        { value: "study", label: "Study" },
        { value: "church", label: "Church" },
        { value: "exercise", label: "Exercise" },
        { value: "personal", label: "Personal/Rest" }
    ];
    const monday = getMondayForWeek(selectedWeek.value);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const activities = JSON.parse(localStorage.getItem("lifeBalanceActivities") || "[]");
    const table = createHoursSummaryTable();
    const tableBody = document.createElement("tbody");

    categories.forEach(function(category) {
        addHoursSummaryRow(tableBody, category, activities, dateToString(monday), dateToString(sunday));
    });
    table.appendChild(tableBody);
    summary.appendChild(table);
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

        const activityIndex = activities.indexOf(activity);

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "delete-activity";
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", function() {
            deleteActivity(activityIndex);
        });

        const actualStartInput = document.createElement("input");
        actualStartInput.type = "time";
        actualStartInput.id = "actual-start-" + activityIndex;
        actualStartInput.className = "actual-time";
        actualStartInput.value = activity.actualStart || "";

        const actualEndInput = document.createElement("input");
        actualEndInput.type = "time";
        actualEndInput.id = "actual-end-" + activityIndex;
        actualEndInput.className = "actual-time";
        actualEndInput.value = activity.actualEnd || "";

        const actualMessage = document.createElement("div");
        actualMessage.id = "actual-message-" + activityIndex;
        actualMessage.className = "actual-message";

        const actualSubmitButton = document.createElement("button");
        actualSubmitButton.type = "button";
        actualSubmitButton.className = "submit-actual-times";
        actualSubmitButton.textContent = "Save Actual Times";
        actualSubmitButton.addEventListener("click", function(event) {
            handleActualSubmit(event, activityIndex);
        });

        activityElement.appendChild(activityText);
        activityElement.appendChild(deleteButton);
        activityElement.appendChild(actualStartInput);
        activityElement.appendChild(actualEndInput);
        activityElement.appendChild(actualMessage);
        activityElement.appendChild(actualSubmitButton);
        dayElement.appendChild(activityElement);
    });

    timetable.appendChild(dayElement);
}

// Show the activities belonging to the selected week.
function renderTimetable() {
    const selectedWeek = document.getElementById("selected-week");
    const timetable = document.getElementById("timetable");
    timetable.textContent = "";
    renderHoursSummary();

    if (selectedWeek.value === "") {
        timetable.textContent = "Select a week to see activities.";
        renderWarnings();
        return;
    }

    const monday = getMondayForWeek(selectedWeek.value);

    for (let day = 0; day < 7; day++) {
        renderDay(day, monday, timetable);
    }
    renderWarnings();
}

// Start the planner application after the page has loaded.
function startPlanner() {
    const activityForm = document.getElementById("activity-form");
    const targetsForm = document.getElementById("targets-form");
    const selectedWeek = document.getElementById("selected-week");
    const addDateButton = document.getElementById("add-additional-date");
    const recentSelect = document.getElementById("recent-activity");

    if (selectedWeek.value === "") {
        selectedWeek.value = getCurrentWeekValue();
    }

    activityForm.addEventListener("submit", handleActivitySubmit);
    targetsForm.addEventListener("submit", handleTargetsSubmit);
    addDateButton.addEventListener("click", addAdditionalDate);
    selectedWeek.addEventListener("change", renderTimetable);
    recentSelect.addEventListener("change", useRecentActivity);
    loadWeeklyTargets();
    renderRecentActivities();
    renderTimetable();
}

document.addEventListener("DOMContentLoaded", startPlanner);
