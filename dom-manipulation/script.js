// Mock server URL (replace with your server endpoint)
const SERVER_URL = 'https://jsonplaceholder.typicode.com/posts';

// Retrieve quotes and category filter from local storage or initialize with default values
let quotes = JSON.parse(localStorage.getItem('quotes')) || [
  { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
  { text: "Do not wait to strike till the iron is hot; but make it hot by striking.", category: "Action" },
  { text: "Great minds discuss ideas; average minds discuss events; small minds discuss people.", category: "Wisdom" }
];
let lastSelectedCategory = localStorage.getItem('lastSelectedCategory') || 'all';

// Save quotes to local storage
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Save last selected category to local storage
function saveLastSelectedCategory(category) {
  localStorage.setItem('lastSelectedCategory', category);
}

// Function to display a random quote
function showRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];
  document.getElementById('quoteDisplay').textContent = `"${quote.text}" - ${quote.category}`;
  sessionStorage.setItem('lastQuote', JSON.stringify(quote)); // Store last viewed quote in session storage
}

// Function to add a new quote
async function addQuote() {
  const newQuoteText = document.getElementById('newQuoteText').value;
  const newQuoteCategory = document.getElementById('newQuoteCategory').value;
  
  if (newQuoteText && newQuoteCategory) {
    const newQuote = { text: newQuoteText, category: newQuoteCategory };

    // Add quote to local storage
    quotes.push(newQuote);
    saveQuotes();

    // Clear input fields
    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';
    alert('New quote added successfully!');

    // Update category filter with new categories
    updateCategoryFilter();

    // Send new quote to server
    try {
      const response = await fetch(SERVER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newQuote)
      });

      if (!response.ok) {
        throw new Error('Failed to add quote to server');
      }

      const serverResponse = await response.json();
      console.log('Quote added to server:', serverResponse);
    } catch (error) {
      console.error('Error adding quote to server:', error);
    }
  } else {
    alert('Please enter both a quote and a category.');
  }
}

// Function to create and display the add quote form
function createAddQuoteForm() {
  const formDiv = document.createElement('div');

  const quoteInput = document.createElement('input');
  quoteInput.setAttribute('id', 'newQuoteText');
  quoteInput.setAttribute('type', 'text');
  quoteInput.setAttribute('placeholder', 'Enter a new quote');

  const categoryInput = document.createElement('input');
  categoryInput.setAttribute('id', 'newQuoteCategory');
  categoryInput.setAttribute('type', 'text');
  categoryInput.setAttribute('placeholder', 'Enter quote category');

  const addButton = document.createElement('button');
  addButton.textContent = 'Add Quote';
  addButton.onclick = addQuote;

  formDiv.appendChild(quoteInput);
  formDiv.appendChild(categoryInput);
  formDiv.appendChild(addButton);

  document.body.appendChild(formDiv);
}

// Function to export quotes to a JSON file
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', url);
  linkElement.setAttribute('download', 'quotes.json');
  document.body.appendChild(linkElement);
  linkElement.click();
  document.body.removeChild(linkElement);
  URL.revokeObjectURL(url);
}

// Function to import quotes from a JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(event) {
    const importedQuotes = JSON.parse(event.target.result);
    quotes.push(...importedQuotes);
    saveQuotes();
    alert('Quotes imported successfully!');
    updateCategoryFilter(); // Update category filter with new categories
  };
  fileReader.readAsText(event.target.files[0]);
}

// Function to populate the category filter dropdown
function populateCategories() {
  const categoryFilter = document.getElementById('categoryFilter');
  const categories = [...new Set(quotes.map(quote => quote.category))];
  
  // Clear existing options
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';

  // Add new options
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });

  // Set the last selected category
  categoryFilter.value = lastSelectedCategory;
}

// Function to filter quotes based on selected category
function filterQuotes() {
  const selectedCategory = document.getElementById('categoryFilter').value;
  lastSelectedCategory = selectedCategory;
  saveLastSelectedCategory(selectedCategory);

  const filteredQuotes = selectedCategory === 'all' ? quotes : quotes.filter(quote => quote.category === selectedCategory);
  const quoteDisplay = document.getElementById('quoteDisplay');
  quoteDisplay.textContent = '';

  if (filteredQuotes.length > 0) {
    filteredQuotes.forEach(quote => {
      const quoteDiv = document.createElement('div');
      quoteDiv.textContent = `"${quote.text}" - ${quote.category}`;
      quoteDisplay.appendChild(quoteDiv);
    });
  } else {
    quoteDisplay.textContent = 'No quotes available for this category.';
  }
}

// Function to fetch quotes from server
async function fetchQuotesFromServer() {
  try {
    const response = await fetch(SERVER_URL);
    const serverQuotes = await response.json();
    resolveConflicts(serverQuotes);
  } catch (error) {
    console.error('Error fetching quotes from server:', error);
  }
}

// Function to synchronize local quotes with the server
async function syncQuotes() {
  try {
    // Fetch quotes from server
    await fetchQuotesFromServer();

    // Notify user of synchronization
    notifyUser('Quotes have been synchronized with the server.');
  } catch (error) {
    console.error('Error synchronizing quotes with server:', error);
  }
}

// Function to resolve conflicts between local and server data
function resolveConflicts(serverQuotes) {
  const serverQuotesSet = new Set(serverQuotes.map(quote => quote.text));
  const newLocalQuotes = quotes.filter(quote => !serverQuotesSet.has(quote.text));

  // Update local quotes with server quotes
  quotes = [...serverQuotes, ...newLocalQuotes];
  saveQuotes();
  populateCategories();
  filterQuotes();
}

// Function to notify the user of updates or conflicts
function notifyUser(message) {
  const notificationsDiv = document.getElementById('notifications');
  const notification = document.createElement('div');
  notification.textContent = message;
  notificationsDiv.appendChild(notification);

  setTimeout(() => {
    notificationsDiv.removeChild(notification);
  }, 5000);
}

// Call the function to create the add quote form
createAddQuoteForm();

// Initialize category filter
populateCategories();

// Load the last viewed quote from session storage if it exists
const lastQuote = JSON.parse(sessionStorage.getItem('lastQuote'));
if (lastQuote) {
  document.getElementById('quoteDisplay').textContent = `"${lastQuote.text}" - ${lastQuote.category}`;
}

// Apply the last selected filter on page load
filterQuotes();

// Periodically fetch and sync quotes with the server
setInterval(syncQuotes, 30000); // Sync every 30 seconds