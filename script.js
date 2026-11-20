const storageKey = "flashcards";
let flashcards = loadWordPairs();

const wordForm = document.getElementById("word-form");
const englishWord = document.getElementById("english-word");
const germanWord = document.getElementById("german-word");
const wordList = document.getElementById("word-list");
const flashcard = document.getElementById("flashcard");
const nextCard = document.getElementById("next-card");
let currentCardIndex = 0;
let isTranslationShown = false;

// Loads saved word pairs from the browser storage.
function loadWordPairs() {
	const savedPairs = localStorage.getItem(storageKey);

	if (savedPairs === null) {
		return [];
	}

	return JSON.parse(savedPairs);
}

// Saves all current word pairs in the browser storage.
function saveWordPairs() {
	localStorage.setItem(storageKey, JSON.stringify(flashcards));
}

// Adds a submitted word pair and clears the two input fields.
function addWordPair(event) {
	event.preventDefault();

	const english = englishWord.value.trim();
	const german = germanWord.value.trim();

	if (english === "" || german === "") {
		return;
	}

	flashcards.push({ english: english, german: german });
	isTranslationShown = false;
	englishWord.value = "";
	germanWord.value = "";

	saveWordPairs();
	showWordPairs();
	showCurrentCard();
}

wordForm.addEventListener("submit", addWordPair);

// Shows all saved English and German word pairs in the list.
function showWordPairs() {
	wordList.textContent = "";

	for (let index = 0; index < flashcards.length; index++) {
		const pair = flashcards[index];
		const listItem = document.createElement("li");
		const deleteButton = document.createElement("button");

		listItem.textContent = pair.english + " — " + pair.german;
		deleteButton.textContent = "Delete";
		deleteButton.type = "button";
		deleteButton.addEventListener("click", function () {
			deleteWordPair(index);
		});

		listItem.appendChild(deleteButton);
		wordList.appendChild(listItem);
	}
}

// Removes a word pair at the selected position in the list.
function deleteWordPair(index) {
	flashcards.splice(index, 1);

	if (currentCardIndex >= flashcards.length) {
		currentCardIndex = 0;
	}

	isTranslationShown = false;
	saveWordPairs();
	showWordPairs();
	showCurrentCard();
}

// Shows the English word or German translation on the current card.
function showCurrentCard() {
	if (flashcards.length === 0) {
		flashcard.textContent = "Add a word pair to start";
		return;
	}

	const pair = flashcards[currentCardIndex];

	if (isTranslationShown) {
		flashcard.textContent = pair.german;
	} else {
		flashcard.textContent = pair.english;
	}
}

// Switches between the English word and its German translation.
function revealFlashcard() {
	if (flashcards.length === 0) {
		return;
	}

	isTranslationShown = !isTranslationShown;
	showCurrentCard();
}

flashcard.addEventListener("click", revealFlashcard);

// Selects and shows a random card different from the current card.
function showRandomCard() {
	if (flashcards.length < 2) {
		return;
	}

	let newIndex;

	do {
		newIndex = Math.floor(Math.random() * flashcards.length);
	} while (newIndex === currentCardIndex);

	currentCardIndex = newIndex;
	isTranslationShown = false;
	showCurrentCard();
}

nextCard.addEventListener("click", showRandomCard);

showWordPairs();
showCurrentCard();
