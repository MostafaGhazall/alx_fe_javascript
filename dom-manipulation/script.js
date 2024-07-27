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
  document.getElementById('quoteDisplay').innerHTML = `"${quote.text}" - ${quote.category}`;
  sessionStorage.setItem('lastQuote', JSON.stringify(quote)); // Store last viewed quote in session storage
}

// Function to add a new quote
function addQuote() {
  const newQuoteText = document.getElementById('newQuoteText').value;
  const newQuoteCategory = document.getElementById('newQuoteCategory').value;
  
  if (newQuoteText && newQuoteCategory) {
    quotes.push({ text: newQuoteText, category: newQuoteCategory });
    saveQuotes(); // Save to local storage
    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';
    alert('New quote added successfully!');
    updateCategoryFilter(); // Update category filter with new categories
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
  addButton.innerText = 'Add Quote';
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
function updateCategoryFilter() {
  const categoryFilter = document.getElementById('categoryFilter');
  const categories = [...new Set(quotes.map(quote => quote.category))];
  
  // Clear existing options
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';

  // Add new options
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.text = category;
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
  quoteDisplay.innerHTML = '';

  if (filteredQuotes.length > 0) {
    filteredQuotes.forEach(quote => {
      const quoteDiv = document.createElement('div');
      quoteDiv.innerHTML = `"${quote.text}" - ${quote.category}`;
      quoteDisplay.appendChild(quoteDiv);
    });
  } else {
    quoteDisplay.innerHTML = 'No quotes available for this category.';
  }
}

// Call the function to create the add quote form
createAddQuoteForm();

// Initialize category filter
updateCategoryFilter();

// Load the last viewed quote from session storage if it exists
const lastQuote = JSON.parse(sessionStorage.getItem('lastQuote'));
if (lastQuote) {
  document.getElementById('quoteDisplay').innerHTML = `"${lastQuote.text}" - ${lastQuote.category}`;
}

// Apply the last selected filter on page load
filterQuotes();