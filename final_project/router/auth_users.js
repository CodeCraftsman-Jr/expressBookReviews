const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => { //returns boolean
  // Check if the username already exists in the users array
  let userList = users.filter(user => user.username === username);
  return userList.length > 0;
};

const authenticatedUser = (username, password) => { //returns boolean
  // Check if username and password match any user in records
  let validUsers = users.filter(
    user => user.username === username && user.password === password
  );
  return validUsers.length > 0;
};

// Only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (authenticatedUser(username, password)) {
    // Generate JWT access token
    let accessToken = jwt.sign(
      { data: username },
      "access",
      { expiresIn: 60 * 60 }
    );

    // Store token in session
    req.session.authorization = {
      accessToken,
      username
    };

    return res.status(200).json({ message: "User successfully logged in", token: accessToken });
  } else {
    return res.status(401).json({ message: "Invalid username or password" });
  }
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review || req.body.review;
  const username = req.session.authorization.username;

  if (!review) {
    return res.status(400).json({ message: "Review text is required" });
  }

  if (books[isbn]) {
    // Add or update review keyed by username
    books[isbn].reviews[username] = review;
    return res.status(200).json({
      message: `Review for book ISBN ${isbn} added/updated successfully`,
      reviews: books[isbn].reviews
    });
  } else {
    return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
  }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;

  if (books[isbn]) {
    if (books[isbn].reviews[username]) {
      // Delete only this user's review
      delete books[isbn].reviews[username];
      return res.status(200).json({
        message: `Review for book ISBN ${isbn} by user ${username} deleted successfully`,
        reviews: books[isbn].reviews
      });
    } else {
      return res.status(404).json({ message: `No review found for user ${username} on book ISBN ${isbn}` });
    }
  } else {
    return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
