const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let { registerUser, loginUser } = require("./auth_users.js");
const public_users = express.Router();
const booksApiBaseUrl = (process.env.BOOKS_API_URL || 'http://localhost:5000').replace(/\/$/, '');

const requestBookApi = async (url) => {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response ? error.response.status : 'network error';
      throw new Error(`Book API request failed (${status}).`, { cause: error });
    }
    throw error;
  }
};

const getAllBooks = async () => {
  return requestBookApi(`${booksApiBaseUrl}/`);
};

const getBooksByISBN = async (isbn) => {
  return requestBookApi(`${booksApiBaseUrl}/isbn/${encodeURIComponent(isbn)}`);
};

const getBooksByAuthor = async (author) => {
  return requestBookApi(`${booksApiBaseUrl}/author/${encodeURIComponent(author)}`);
};

const getBooksByTitle = async (title) => {
  return requestBookApi(`${booksApiBaseUrl}/title/${encodeURIComponent(title)}`);
};

const findBookByISBN = (isbn) => {
  const normalized = String(isbn || '').trim();
  if (!normalized) return null;

  const directKey = Object.keys(books).find((bookId) => String(books[bookId].isbn) === normalized);
  if (directKey) return books[directKey];

  return Object.values(books).find((book) => String(book.isbn) === normalized) || null;
};

public_users.post("/register", (req,res) => {
  const { username, password } = req.body || {};
  const result = registerUser(username, password);
  return res.status(result.status).json({ message: result.message, user: result.user });
});

public_users.post("/login", (req, res) => loginUser(req, res));

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  return res.status(200).json(books);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const book = findBookByISBN(req.params.isbn);
  if (!book) {
    return res.status(404).json({ message: 'Book not found.' });
  }
  return res.status(200).json(book);
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = (req.params.author || '').trim();
  const matchedBooks = Object.values(books).filter((book) =>
    book.author && book.author.toLowerCase() === author.toLowerCase()
  );

  if (matchedBooks.length === 0) {
    return res.status(404).json({ message: 'No books found for that author.' });
  }

  return res.status(200).json(matchedBooks);
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = (req.params.title || '').trim();
  const matchedBooks = Object.values(books).filter((book) =>
    book.title && book.title.toLowerCase() === title.toLowerCase()
  );

  if (matchedBooks.length === 0) {
    return res.status(404).json({ message: 'No books found for that title.' });
  }

  return res.status(200).json(matchedBooks);
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const book = findBookByISBN(req.params.isbn);
  if (!book) {
    return res.status(404).json({ message: 'Book not found.' });
  }
  return res.status(200).json({ isbn: book.isbn, reviews: book.reviews || {} });
});

module.exports.general = public_users;
module.exports.getAllBooks = getAllBooks;
module.exports.getBooksByISBN = getBooksByISBN;
module.exports.getBooksByAuthor = getBooksByAuthor;
module.exports.getBooksByTitle = getBooksByTitle;
