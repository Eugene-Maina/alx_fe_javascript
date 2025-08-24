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

// Populate categories in dropdown
function populateCategories() {
    const categoryFilter = document.getElementById("categoryFilter");
    const categories = [...new Set(quotes.map(quote => quote.category))]; // Get unique categories
    categoryFilter.innerHTML = '<option value="all">All Categories</option>'; // Reset dropdown
    categories.forEach(category => {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
    
    // Restore last selected filter
    const lastCategory = localStorage.getItem('lastCategory') || 'all';
    categoryFilter.value = lastCategory;
    filterQuotes(); // Apply filter on load
}

// Filter quotes based on selected category
function filterQuotes() {
    const selectedCategory = document.getElementById("categoryFilter").value;
    localStorage.setItem('lastCategory', selectedCategory); // Save selected category
    
    const filteredQuotes = selectedCategory === 'all' 
        ? quotes 
        : quotes.filter(quote => quote.category === selectedCategory);
    
    // Display a random quote from filtered results
    const quoteDisplay = document.getElementById("quoteDisplay");
    if (filteredQuotes.length === 0) {
        quoteDisplay.innerHTML = "No quotes available for this category.";
        return;
    }
    
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const quote = filteredQuotes[randomIndex];
    quoteDisplay.innerHTML = `"${quote.text}" — ${quote.category}`;
    
    // Store the last viewed quote
    sessionStorage.setItem('lastQuote', JSON.stringify(quote));
}

// Display a random quote (modified to use filter)
function showRandomQuotes() {
    filterQuotes(); // Use filterQuotes to respect current category selection
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
        saveQuotes();
        populateCategories(); // Update categories in dropdown
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
            if (Array.isArray(importedQuotes) && importedQuotes.every(q => q.text && q.category)) {
                quotes.push(...importedQuotes);
                saveQuotes();
                populateCategories(); // Update categories after import
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
document.getElementById("categoryFilter").addEventListener("change", filterQuotes);

// Load and display quote on page load
window.addEventListener("load", () => {
    populateCategories(); // Populate categories and apply last filter
    const lastQuote = JSON.parse(sessionStorage.getItem('lastQuote'));
    if (lastQuote) {
        document.getElementById("quoteDisplay").innerHTML = `"${lastQuote.text}" — ${lastQuote.category}`;
    } else {
        filterQuotes();
    }
});