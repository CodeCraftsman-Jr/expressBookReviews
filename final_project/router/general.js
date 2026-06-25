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

// Get the book list available in the shop — Task 11: async/await with Promise
public_users.get('/', async function (req, res) {
  try {
    // Use a Promise to retrieve all books
    const getAllBooks = () => {
      return new Promise((resolve, reject) => {
        if (books) {
          resolve(books);
        } else {
          reject(new Error("Books not found"));
        }
      });
    };
    const allBooks = await getAllBooks();
    return res.status(200).json(allBooks);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books", error: error.message });
  }
});

// Get book details based on ISBN — Task 12: Promise callback (.then/.catch)
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  const getBookByISBN = new Promise((resolve, reject) => {
    const book = books[isbn];
    if (book) {
      resolve(book);
    } else {
      reject(new Error(`Book with ISBN ${isbn} not found`));
    }
  });

  getBookByISBN
    .then(book => res.status(200).json(book))
    .catch(err => res.status(404).json({ message: err.message }));
});

// Get book details based on author — Task 13: Promise
public_users.get('/author/:author', function (req, res) {
  const authorQuery = req.params.author;

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

  getBooksByAuthor
    .then(result => res.status(200).json(result))
    .catch(err => res.status(404).json({ message: err.message }));
});

// Get all books based on title — Task 14: async/await
public_users.get('/title/:title', async function (req, res) {
  const titleQuery = req.params.title;
  try {
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
