const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

// Parse JSON request bodies
app.use(express.json());

// Session middleware for /customer routes
app.use("/customer", session({
  secret: "fingerprint_customer",
  resave: true,
  saveUninitialized: true
}));

// JWT Authentication middleware for protected routes (/customer/auth/*)
// Verifies the JWT token stored in the session before allowing access
app.use("/customer/auth/*", function auth(req, res, next) {
  // Check if a session and JWT token exist
  if (req.session.authorization) {
    const token = req.session.authorization['accessToken'];
    // Verify the token using the same secret used to sign it
    jwt.verify(token, "access", (err, user) => {
      if (!err) {
        req.user = user;
        next();
      } else {
        return res.status(403).json({ message: "User not authenticated" });
      }
    });
  } else {
    return res.status(403).json({ message: "User not logged in" });
  }
});

const PORT = 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log("Server is running"));
