# Spec: Vocab Flashcards

## Goal (one or two sentences)
I want to build a single-page app where I can add English–German word pairs and practise them as flashcards. The browser saves my word pairs so they’re still there when I reload the page.
## Users
Me, on my laptop browser 
## Features (numbered, so prompts can refer to them)
F1. Add an English–German word pair using a form.
F2. Show all saved word pairs in a list.
F3. Delete a word pair from the list.
F4. Save word pairs in the browser so they survive a reload.
F5. Show an English word and reveal the German translation on click.
F6. Pick a random different card when I click Next, if there are at least two cards.
F7. Count how many cards I mark “I knew it” during the session.

## Acceptance criteria (how I know a feature works)

F1. If either field is blank, the form cannot be submitted. After I add a valid pair, both fields clear.
F2. When I add `apple` and `Apfel`, I can see both words together in the list.
F3. When I click Delete beside a pair, that pair disappears from the list.
F4. After I reload the page, saved pairs are still visible and deleted pairs stay gone.
F5. A flashcard starts by showing the English word. When I click the card, I see its German translation.
F6. With at least two cards, clicking Next always shows a different card with its translation hidden.
F7. When I mark a card “I knew it,” the session count goes up by one. The count starts at zero after a page reload.

## Out of scope (do NOT build)

Login, a server, or a database.
Frameworks or libraries such as React, jQuery, or Bootstrap.
Sound or animations beyond simple CSS transitions.
A separate mobile app.

## Look & feel

A simple, readable page with one centered column, a maximum width of about 600 px, and one accent colour.