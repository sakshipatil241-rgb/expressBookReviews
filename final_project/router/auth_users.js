const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  return typeof username === 'string' && username.trim().length >= 3 && /^[a-zA-Z0-9_]+$/.test(username.trim());
}

const authenticatedUser = (username,password)=>{ //returns boolean
  return users.some((user) => user.username === username && user.password === password);
}

const findBookByISBN = (isbn) => {
  const normalized = String(isbn || '').trim();
  if (!normalized) return null;

  const key = Object.keys(books).find((bookId) => String(books[bookId].isbn) === normalized);
  if (key) return books[key];

  const direct = Object.values(books).find((book) => String(book.isbn) === normalized);
  return direct || null;
}

const registerUser = (username, password) => {
  const cleanUsername = typeof username === 'string' ? username.trim() : '';
  const cleanPassword = typeof password === 'string' ? password.trim() : '';

  if (!isValid(cleanUsername) || cleanPassword.length < 6) {
    return { status: 400, user: null, message: 'Username must be at least 3 letters/numbers and password at least 6 characters.' };
  }

  if (users.some((user) => user.username === cleanUsername)) {
    return { status: 409, user: null, message: 'User already exists.' };
  }

  users.push({ username: cleanUsername, password: cleanPassword });
  return { status: 201, user: { username: cleanUsername }, message: 'User registered successfully.' };
};

regd_users.post("/register", (req,res) => {
  const { username, password } = req.body || {};
  const result = registerUser(username, password);
  return res.status(result.status).json({ message: result.message, user: result.user });
});

//only registered users can login
regd_users.post("/login", (req,res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({message: "Username and password are required."});
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid credentials." });
  }

  req.session.user = username;
  return res.status(200).json({ message: "Login successful.", username });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { review } = req.body || {};
  const isbn = req.params.isbn;
  const book = findBookByISBN(isbn);

  if (!req.session || !req.session.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!book) {
    return res.status(404).json({ message: "Book not found." });
  }

  if (!review || typeof review !== 'string' || review.trim().length === 0) {
    return res.status(400).json({ message: "Review is required." });
  }

  book.reviews[req.session.user] = review.trim();
  return res.status(200).json({ message: "Review added/updated successfully.", reviews: book.reviews });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const { user } = req.session || {};
  const isbn = req.params.isbn;
  const book = findBookByISBN(isbn);

  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!book) {
    return res.status(404).json({ message: "Book not found." });
  }

  if (!book.reviews[user]) {
    return res.status(404).json({ message: "Review not found for this user." });
  }

  delete book.reviews[user];
  return res.status(200).json({ message: "Review deleted successfully.", reviews: book.reviews });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
module.exports.registerUser = registerUser;
