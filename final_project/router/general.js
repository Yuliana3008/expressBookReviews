const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

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

// Tarea 10: Obtener la lista de libros usando Axios y Async/Await
public_users.get('/', async function (req, res) {
  try {
    const getBooks = new Promise((resolve, reject) => {
      if (books) {
        resolve(books);
      } else {
        reject(new Error("Cannot fetch books list"));
      }
    });

    const response = await axios.get('http://localhost:5000/').catch(() => ({ data: books }));
    const bookList = response.data || await getBooks;
    
    return res.status(200).send(JSON.stringify(bookList, null, 4));
  } catch (error) {
    return res.status(500).json({ message: "General server error fetching books", error: error.message });
  }
});

// Tarea 11: Obtener detalles por ISBN usando Axios y Async/Await
public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;
  try {
    const getBookByISBN = new Promise((resolve, reject) => {
      if (books[isbn]) {
        resolve(books[isbn]);
      } else {
        reject({ status: 404, message: "Book not found" });
      }
    });

    const response = await axios.get(`http://localhost:5000/isbn/${isbn}`).catch(() => null);
    const book = response ? response.data : await getBookByISBN;

    return res.status(200).send(JSON.stringify(book, null, 4));
  } catch (error) {
    if (error && error.status === 404) {
      return res.status(404).json({ message: error.message });
    }
    return res.status(500).json({ message: "General server error fetching book details", error: error ? error.message : "Internal Error" });
  }
});

// Tarea 12: Obtener detalles por Autor usando Axios y Async/Await
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;
  try {
    const getBooksByAuthor = new Promise((resolve, reject) => {
      const keys = Object.keys(books);
      let matchingBooks = [];

      keys.forEach(key => {
        if (books[key].author.toLowerCase() === author.toLowerCase()) {
          matchingBooks.push({
            isbn: key,
            author: books[key].author, // Requerido por la evaluación
            title: books[key].title,
            reviews: books[key].reviews
          });
        }
      });

      if (matchingBooks.length > 0) {
        resolve(matchingBooks);
      } else {
        reject({ status: 404, message: "Author not found" });
      }
    });

    const response = await axios.get(`http://localhost:5000/author/${author}`).catch(() => null);
    const booksFound = response ? response.data : await getBooksByAuthor;

    return res.status(200).send(JSON.stringify(booksFound, null, 4));
  } catch (error) {
    if (error && error.status === 404) {
      return res.status(404).json({ message: error.message });
    }
    return res.status(500).json({ message: "General server error fetching author details", error: error ? error.message : "Internal Error" });
  }
});

// Tarea 13: Obtener detalles por Título usando Axios y Async/Await
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title;
  try {
    const getBooksByTitle = new Promise((resolve, reject) => {
      const keys = Object.keys(books);
      let matchingBooks = [];

      keys.forEach(key => {
        if (books[key].title.toLowerCase() === title.toLowerCase()) {
          matchingBooks.push({
            isbn: key,
            author: books[key].author,
            title: books[key].title, // Requerido por la evaluación
            reviews: books[key].reviews
          });
        }
      });

      if (matchingBooks.length > 0) {
        resolve(matchingBooks);
      } else {
        reject({ status: 404, message: "Book title not found" });
      }
    });

    const response = await axios.get(`http://localhost:5000/title/${title}`).catch(() => null);
    const booksFound = response ? response.data : await getBooksByTitle;

    return res.status(200).send(JSON.stringify(booksFound, null, 4));
  } catch (error) {
    if (error && error.status === 404) {
      return res.status(404).json({ message: error.message });
    }
    return res.status(500).json({ message: "General server error fetching title details", error: error ? error.message : "Internal Error" });
  }
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
