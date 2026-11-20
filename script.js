const flashcards = [];

const wordForm = document.getElementById("word-form");
const englishWord = document.getElementById("english-word");
const germanWord = document.getElementById("german-word");

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
}

wordForm.addEventListener("submit", addWordPair);
