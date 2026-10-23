const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  // Retorna true si el nombre de usuario ya está registrado
  return users.some((user) => user.username === username);
}

const authenticatedUser = (username, password) => {
  // Retorna true si las credenciales coinciden con algún usuario registrado
  return users.some((user) => user.username === username && user.password === password);
}

// Iniciar sesión para usuarios registrados
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in. Username and password are required" });
  }

  if (authenticatedUser(username, password)) {
    // Genera el token JWT
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });

    // Guarda los datos de autenticación en la sesión
    req.session.authorization = {
      accessToken, username
    }
    return res.status(200).send("User successfully logged in");
  } else {
    return res.status(208).json({ message: "Invalid Login. Check username and password" });
  }
});

// Añadir o modificar una reseña de libro
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization['username'];

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!review) {
    return res.status(400).json({ message: "Review content is required" });
  }

  // Añade o actualiza la reseña para el usuario activo
  books[isbn].reviews[username] = review;

  return res.status(200).send(`The review for the book with ISBN ${isbn} has been added/updated.`);
});

// Eliminar una reseña de libro (Tarea 9)
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization['username'];

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (books[isbn].reviews[username]) {
    delete books[isbn].reviews[username];
    return res.status(200).send(`Reviews for the ISBN ${isbn} posted by the user ${username} deleted.`);
  } else {
    return res.status(404).json({ message: "No review found for this user on the specified book." });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;