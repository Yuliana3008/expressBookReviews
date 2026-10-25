const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer", session({ secret: "fingerprint_customer", resave: true, saveUninitialized: true }));

app.use("/customer/auth/*", function auth(req, res, next) {
    // Verificar si la sesión tiene datos de autorización
    if (req.session.authorization) {
        let token = req.session.authorization['accessToken'];
        
        // Validar el token con la clave secreta ("access")
        jwt.verify(token, "access", (err, user) => {
            if (!err) {
                req.user = user;
                next(); // Token válido, permite el acceso a la ruta
            } else {
                return res.status(403).json({ message: "Usuario no autenticado" });
            }
        });
    } else {
        return res.status(404).json({ message: "Usuario no ha iniciado sesión" });
    }
});

const PORT = 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log("Server is running"));