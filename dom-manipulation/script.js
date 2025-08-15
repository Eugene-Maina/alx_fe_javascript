// Initialize quotes array, loading from local storage if available
let quotes = JSON.parse(localStorage.getItem('quotes')) || [
    { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
    { text: "Life is what happens when you're busy making other plans.", category: "Life" },
    { text: "In the middle of every difficulty lies opportunity.", category: "Inspiration" }
];

// Save quotes to local storage
function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Display a random quote
function showRandomQuotes() {
    if (quotes.length === 0) {
        document.getElementById("quoteDisplay").innerHTML = "There are no quotes to show, please add some";
        return;
    }
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const quote = quotes[randomIndex];
    const quoteDisplay = document.getElementById("quoteDisplay");
    quoteDisplay.innerHTML = `"${quote.text}" — ${quote.category}`;
    
    // Store the last viewed quote in session storage
    sessionStorage.setItem('lastQuote', JSON.stringify(quote));
}

// Add a new quote
function createAddQuoteForm() {
    const textInput = document.getElementById("newQuoteText");
    const categoryInput = document.getElementById("newQuoteCategory");
    const newQuoteText = textInput.value.trim();
    const newQuoteCategory = categoryInput.value.trim();

    if (newQuoteText && newQuoteCategory) {
        quotes.push({ text: newQuoteText, category: newQuoteCategory });
        textInput.value = "";
        categoryInput.value = "";
        saveQuotes(); // Save to local storage
        alert("Quote added successfully");
    } else {
        alert("Please enter both quote and category!");
    }
}

// Export quotes to a JSON file
function exportToJsonFile() {
    const dataStr = JSON.stringify(quotes);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "quotes.json";
    link.click();
    URL.revokeObjectURL(url);
}

// Import quotes from a JSON file
function importFromJsonFile(event) {
    const fileReader = new FileReader();
    fileReader.onload = function(event) {
        try {
            const importedQuotes = JSON.parse(event.target.result);
            // Validate that imported data is an array of objects with text and category
            if (Array.isArray(importedQuotes) && importedQuotes.every(q => q.text && q.category)) {
                quotes.push(...importedQuotes);
                saveQuotes();
                alert("Quotes imported successfully!");
            } else {
                alert("Invalid JSON format. Please ensure the file contains an array of quotes with 'text' and 'category' properties.");
            }
        } catch (e) {
            alert("Error reading JSON file. Please ensure it's a valid JSON file.");
        }
    };
    fileReader.readAsText(event.target.files[0]);
}

// Event listeners
document.getElementById("newQuote").addEventListener("click", showRandomQuotes);
document.getElementById("addQuoteBtn").addEventListener("click", createAddQuoteForm);
document.getElementById("exportQuotes").addEventListener("click", exportToJsonFile);

// Load and display the last viewed quote from session storage on page load
window.addEventListener("load", () => {
    const lastQuote = JSON.parse(sessionStorage.getItem('lastQuote'));
    if (lastQuote) {
        document.getElementById("quoteDisplay").innerHTML = `"${lastQuote.text}" — ${lastQuote.category}`;
    } else {
        showRandomQuotes();
    }
});