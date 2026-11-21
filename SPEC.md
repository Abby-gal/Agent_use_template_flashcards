# Spec: Life Balance Planner

## Goal: 
I want to plan my week across work, study, church, exercise, and personal or rest time. I want to compare my planned hours with my actual hours and see when activities overlap or I go over my limits.


## Users:
 Me, using the planner in my laptop browser.


## Features (numbered, so prompts can refer to them)
F1. Add an activity with a name, category, date, and planned start and end times.
F2. Select a week and see its activities in a timetable with colour and text labels for each category.
F3. Delete an activity from the timetable.
F4. Record actual start and end times for an activity after it happens.
F5. Compare planned and actual weekly hours for each category and see progress toward my exercise goal.
F6. Let me select additional dates in the Add activity form and reuse the same name, category, and planned times on all selected dates.
F7. Let me set a weekly work maximum, a combined maximum for work, study, and church, an exercise goal, and a minimum for planned personal or rest time. Save these targets in the browser when I click Update targets.
F8. Show a warning when activities overlap, when planned or actual hours exceed a maximum, or when planned rest falls below my minimum.

## Acceptance criteria (how I know a feature works)
F1. Adding a valid activity puts it on the correct date. Leaving a required field blank or entering an end time before the start time prevents submission.
F2. Changing the selected week shows the activities for that week. Each activity has a category label, and unused slots stay open.
F3. Deleting an activity removes it from the timetable and updates the weekly totals.
F4. Recording 09:15 to 10:45 for a planned 09:00 to 11:00 activity keeps the planned times and records 1.5 actual hours.
F5. A category with 2 planned hours and 1.5 actual hours shows both totals. With a 3-hour exercise goal, 1.5 actual exercise hours shows 50% progress.
F6. If I enter a Work shift from 09:00 to 17:00 and select three different dates, submitting the form creates one 8-hour shift on each date. If I leave the additional dates empty, the form creates one shift on the original date
F7. If I enter 25, 50, 3, and 5 hours and click Update targets, all four values are still in the fields after I reload. The same targets apply when I switch to another week.
F8. If I record 30 work hours against a 25-hour limit, the warning says I am 5 hours over. A study session that overlaps a church activity triggers a conflict warning. Planning 3 hours of rest with a 5-hour minimum shows that I am 2 hours short.


## Out of scope (do NOT build)
Editing an activity's name, category, date, or planned times after adding it.
Extra charts beyond the timetable and weekly hours summary.

## Look & feel
A readable page with an activity form, a weekly timetable, and an hours summary. Each category has its own colour and a written label. Warnings explain the problem in plain language.
