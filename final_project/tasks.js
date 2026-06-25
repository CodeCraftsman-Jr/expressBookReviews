const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

// Task 10: Get all books – Using async callback function
async function getAllBooks() {
  try {
    const response = await axios.get(`${BASE_URL}/`);
    console.log("=== Task 10: Get All Books ===");
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error("Error in Task 10:", error.message);
  }
}

// Task 11: Search by ISBN – Using Promises
function getBookByISBN(isbn) {
  axios.get(`${BASE_URL}/isbn/${isbn}`)
    .then(response => {
      console.log(`=== Task 11: Search by ISBN (${isbn}) ===`);
      console.log(JSON.stringify(response.data, null, 2));
    })
    .catch(error => {
      console.error("Error in Task 11:", error.message);
    });
}

// Task 12: Search by Author
function getBooksByAuthor(author) {
  axios.get(`${BASE_URL}/author/${author}`)
    .then(response => {
      console.log(`=== Task 12: Search by Author (${author}) ===`);
      console.log(JSON.stringify(response.data, null, 2));
    })
    .catch(error => {
      console.error("Error in Task 12:", error.message);
    });
}

// Task 13: Search by Title
async function getBooksByTitle(title) {
  try {
    const response = await axios.get(`${BASE_URL}/title/${title}`);
    console.log(`=== Task 13: Search by Title (${title}) ===`);
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error("Error in Task 13:", error.message);
  }
}

// Execute the functions
async function runAll() {
  await getAllBooks();
  getBookByISBN("1");
  getBooksByAuthor("Jane Austen");
  await getBooksByTitle("Pride and Prejudice");
}

runAll();
