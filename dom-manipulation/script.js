// Initialize quotes array and server state
let quotes = JSON.parse(localStorage.getItem('quotes')) || [
    { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation", id: 1 },
    { text: "Life is what happens when you're busy making other plans.", category: "Life", id: 2 },
    { text: "In the middle of every difficulty lies opportunity.", category: "Inspiration", id: 3 }
];
let lastSyncTime = localStorage.getItem('lastSyncTime') || 0;
const SERVER_URL = 'https://jsonplaceholder.typicode.com/posts'; // Using JSONPlaceholder as mock server

// Save quotes to local storage with timestamp
function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
    localStorage.setItem('lastSyncTime', Date.now());
}

// Fetch quotes from server
async function fetchServerQuotes() {
    try {
        const response = await fetch(SERVER_URL);
        const serverData = await response.json();
        // Transform JSONPlaceholder data to match our quote format
        return serverData.slice(0, 5).map((item, index) => ({
            text: item.title, // Using title as quote text
            category: ["Motivation", "Life", "Inspiration", "Wisdom", "Success"][index % 5],
            id: item.id,
            lastModified: Date.now()
        }));
    } catch (error) {
        console.error('Error fetching server quotes:', error);
        showNotification('Failed to fetch server quotes', 'error');
        return [];
    }
}

// Sync local data with server
async function syncWithServer() {
    const serverQuotes = await fetchServerQuotes();
    const localQuotes = [...quotes];
    
    // Simple conflict resolution: server data takes precedence for same IDs
    const mergedQuotes = [...localQuotes];
    
    serverQuotes.forEach(serverQuote => {
        const localIndex = mergedQuotes.findIndex(q => q.id === serverQuote.id);
        if (localIndex === -1) {
            // New quote from server
            mergedQuotes.push(serverQuote);
            showNotification(`New quote added from server: "${serverQuote.text}"`, 'success');
        } else if (serverQuote.lastModified > (mergedQuotes[localIndex].lastModified || 0)) {
            // Server quote is newer
            mergedQuotes[localIndex] = serverQuote;
            showNotification(`Quote updated from server: "${serverQuote.text}"`, 'info');
        }
    });

    // Check for local quotes not on server
    localQuotes.forEach(localQuote => {
        if (!serverQuotes.some(sq => sq.id === localQuote.id)) {
            // Simulate sending local quote to server
            sendQuoteToServer(localQuote);
        }
    });

    quotes = mergedQuotes;
    saveQuotes();
    populateCategories();
    filterQuotes();
}

// Send local quote to server
async function sendQuoteToServer(quote) {
    try {
        const response = await fetch(SERVER_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: quote.text,
                body: quote.category,
                userId: 1 // Required by JSONPlaceholder
            })
        });
        const result = await response.json();
        quote.id = result.id; // Update quote with server-assigned ID
        showNotification(`Quote synced to server: "${quote.text}"`, 'success');
    } catch (error) {
        console.error('Error sending quote to server:', error);
        showNotification('Failed to sync quote to server', 'error');
    }
}

// Manual conflict resolution UI
function showConflictResolutionUI(localQuote, serverQuote) {
    const conflictDiv = document.createElement('div');
    conflictDiv.className = 'conflict-resolution';
    conflictDiv.innerHTML = `
        <h3>Conflict Detected</h3>
        <p>Local Quote: "${localQuote.text}"</p>
        <p>Server Quote: "${serverQuote.text}"</p>
        <button onclick="resolveConflict('local', ${localQuote.id})">Keep Local</button>
        <button onclick="resolveConflict('server', ${serverQuote.id})">Keep Server</button>
    `;
    document.body.appendChild(conflictDiv);
}

// Resolve conflict manually
function resolveConflict(choice, id) {
    const conflictDiv = document.querySelector('.conflict-resolution');
    if (choice === 'local') {
        sendQuoteToServer(quotes.find(q => q.id === id));
    } else {
        const serverQuote = quotes.find(q => q.id === id);
        showNotification(`Server quote kept: "${serverQuote.text}"`, 'info');
    }
    conflictDiv.remove();
    syncWithServer();
}

// Show notification to user
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// Modified createAddQuoteForm to include server sync
function createAddQuoteForm() {
    const textInput = document.getElementById("newQuoteText");
    const categoryInput = document.getElementById("newQuoteCategory");
    const newQuoteText = textInput.value.trim();
    const newQuoteCategory = categoryInput.value.trim();

    if (newQuoteText && newQuoteCategory) {
        const newQuote = {
            text: newQuoteText,
            category: newQuoteCategory,
            id: Date.now(), // Temporary ID until server assigns one
            lastModified: Date.now()
        };
        quotes.push(newQuote);
        textInput.value = "";
        categoryInput.value = "";
        saveQuotes();
        populateCategories();
        sendQuoteToServer(newQuote); // Sync new quote with server
        alert("Quote added successfully");
    } else {
        alert("Please enter both quote and category!");
    }
}

// Periodic sync (every 30 seconds)
function startAutoSync() {
    setInterval(syncWithServer, 30000);
}

// Modified window load event
window.addEventListener("load", () => {
    populateCategories();
    const lastQuote = JSON.parse(sessionStorage.getItem('lastQuote'));
    if (lastQuote) {
        document.getElementById("quoteDisplay").innerHTML = `"${lastQuote.text}" — ${lastQuote.category}`;
    } else {
        filterQuotes();
    }
    startAutoSync(); // Start periodic syncing
    syncWithServer(); // Initial sync
});