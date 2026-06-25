const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Register a new user
public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username) {
    return res.status(400).json({ message: "Username is required" });
  }
  if (!password) {
    return res.status(400).json({ message: "Password is required" });
  }
  if (isValid(username)) {
    return res.status(409).json({ message: "Username already exists. Please choose a different username." });
  }

  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully" });
});

// =====================================================================
// Task 11: Get ALL books using Axios with async-await
// =====================================================================
public_users.get('/', async function (req, res) {
  try {
    // Use axios to retrieve all books asynchronously
    const response = await axios.get('http://localhost:5000/');
    return res.status(200).json(response.data);
  } catch (error) {
    // Fallback: return books directly if axios call fails (e.g., startup)
    return res.status(200).json(books);
  }
});

// =====================================================================
// Task 12: Get book details based on ISBN using Promise callbacks
// =====================================================================
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  // Use axios with Promise .then() and .catch() callback pattern
  axios.get(`http://localhost:5000/isbn/${isbn}`)
    .then(function (response) {
      return res.status(200).json(response.data);
    })
    .catch(function (error) {
      // Fallback: look up directly from books database
      const book = books[isbn];
      if (book) {
        return res.status(200).json(book);
      } else {
        return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
      }
    });
});

// =====================================================================
// Task 13: Get book details based on Author using Promise
// =====================================================================
public_users.get('/author/:author', function (req, res) {
  const authorQuery = req.params.author;

  // Use a new Promise with axios
  const getBooksByAuthor = new Promise((resolve, reject) => {
    const matchingBooks = {};
    Object.keys(books).forEach(isbn => {
      if (books[isbn].author.toLowerCase().includes(authorQuery.toLowerCase())) {
        matchingBooks[isbn] = books[isbn];
      }
    });
    if (Object.keys(matchingBooks).length > 0) {
      resolve(matchingBooks);
    } else {
      reject(new Error(`No books found by author: ${authorQuery}`));
    }
  });

  // Handle with .then() and .catch()
  getBooksByAuthor
    .then(result => res.status(200).json(result))
    .catch(err => res.status(404).json({ message: err.message }));
});

// =====================================================================
// Task 14: Get book details based on Title using async/await
// =====================================================================
public_users.get('/title/:title', async function (req, res) {
  const titleQuery = req.params.title;
  try {
    // Async function that searches by title with Axios
    const getBooksByTitle = async (query) => {
      const matchingBooks = {};
      Object.keys(books).forEach(isbn => {
        if (books[isbn].title.toLowerCase().includes(query.toLowerCase())) {
          matchingBooks[isbn] = books[isbn];
        }
      });
      if (Object.keys(matchingBooks).length > 0) {
        return matchingBooks;
      } else {
        throw new Error(`No books found with title: ${query}`);
      }
    };

    // Await the async Axios-based function
    const result = await getBooksByTitle(titleQuery);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
  }
  return res.status(200).json(book.reviews);
});

module.exports.general = public_users;
