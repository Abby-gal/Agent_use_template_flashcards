const flashcards = [];

const wordForm = document.getElementById("word-form");
const englishWord = document.getElementById("english-word");
const germanWord = document.getElementById("german-word");
const wordList = document.getElementById("word-list");

// Adds a submitted word pair and clears the two input fields.
function addWordPair(event) {
	event.preventDefault();

	const english = englishWord.value.trim();
	const german = germanWord.value.trim();

	if (english === "" || german === "") {
		return;
	}

	flashcards.push({ english: english, german: german });
	englishWord.value = "";
	germanWord.value = "";

	showWordPairs();
}

wordForm.addEventListener("submit", addWordPair);

// Shows all saved English and German word pairs in the list.
function showWordPairs() {
	wordList.textContent = "";

	for (const pair of flashcards) {
		const listItem = document.createElement("li");
		listItem.textContent = pair.english + " — " + pair.german;
		wordList.appendChild(listItem);
	}
}
