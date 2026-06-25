const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

// Parse JSON request bodies
app.use(express.json());

// Session middleware for /customer routes
// The secret is used to sign the session ID cookie
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
        // Attach user info to request for use in route handlers
        req.user = user;
        next(); // Proceed to next middleware/route handler
      } else {
        // Token is invalid or expired
        return res.status(403).json({ message: "User not authenticated" });
      }
    });
  } else {
    // No authorization session found
    return res.status(403).json({ message: "User not logged in" });
  }
});

const PORT = 5000;

// Mount customer (authenticated) routes under /customer
app.use("/customer", customer_routes);
// Serve developer playground
app.get("/playground", (req, res) => {
  res.sendFile(__dirname + "/public/playground.html");
});
// Mount general (public) routes under /
app.use("/", genl_routes);

// Start the server
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

