const express = require('express');
const app = express();
const port = 5000;
app.use(express.json());
const cors = require('cors'); // Import CORS middleware
const connectToMongoDB = require('./db');

// Middleware to enable CORS
app.use(cors()); // Enable CORS for all routes

// Require and invoke db.js to get data
(async () => {
  try {
    // Fetch data from all collections
    const allData = await connectToMongoDB();

    // Store data from different collections
    global.quiz = allData.quiz;
    global.results=allData.results;
    app.listen(port, () => {
      console.log(`Example app listening on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Error loading food data:", error);
  }
})();

app.get('/', (req, res) => {
  res.send('Hello World!')
});

// Mount the auth router at the specified route
app.use('/api/auth', require('./routes/auth'));

