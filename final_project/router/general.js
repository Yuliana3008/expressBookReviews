const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({ message: "Unable to register user. Username and password are required." });
  }

  const userExists = users.some((user) => user.username === username);

  if (userExists) {
    return res.status(404).json({ message: "User already exists!" });
  }

  users.push({ "username": username, "password": password });
  return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

// Tarea 10: Obtener la lista de libros usando Promesas
public_users.get('/', function (req, res) {
  const getBooks = new Promise((resolve, reject) => {
    resolve(books);
  });

  getBooks
    .then((bookList) => res.status(200).send(JSON.stringify(bookList, null, 4)))
    .catch((err) => res.status(500).json({ message: "Error fetching books" }));
});

// Tarea 11: Obtener detalles por ISBN usando Promesas
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  const getBookByISBN = new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject("Book not found");
    }
  });

  getBookByISBN
    .then((book) => res.status(200).send(JSON.stringify(book, null, 4)))
    .catch((err) => res.status(404).json({ message: err }));
});

// Tarea 12: Obtener detalles por Autor usando Promesas
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;

  const getBooksByAuthor = new Promise((resolve, reject) => {
    const keys = Object.keys(books);
    let matchingBooks = [];

    keys.forEach(key => {
      if (books[key].author.toLowerCase() === author.toLowerCase()) {
        matchingBooks.push({
          isbn: key,
          title: books[key].title,
          reviews: books[key].reviews
        });
      }
    });

    if (matchingBooks.length > 0) {
      resolve(matchingBooks);
    } else {
      reject("Author not found");
    }
  });

  getBooksByAuthor
    .then((booksFound) => res.status(200).send(JSON.stringify(booksFound, null, 4)))
    .catch((err) => res.status(404).json({ message: err }));
});

// Tarea 13: Obtener detalles por Título usando Promesas
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;

  const getBooksByTitle = new Promise((resolve, reject) => {
    const keys = Object.keys(books);
    let matchingBooks = [];

    keys.forEach(key => {
      if (books[key].title.toLowerCase() === title.toLowerCase()) {
        matchingBooks.push({
          isbn: key,
          author: books[key].author,
          reviews: books[key].reviews
        });
      }
    });

    if (matchingBooks.length > 0) {
      resolve(matchingBooks);
    } else {
      reject("Book title not found");
    }
  });

  getBooksByTitle
    .then((booksFound) => res.status(200).send(JSON.stringify(booksFound, null, 4)))
    .catch((err) => res.status(404).json({ message: err }));
});

// Obtener reseñas de un libro
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  if (books[isbn]) {
    return res.status(200).send(JSON.stringify(books[isbn].reviews, null, 4));
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;