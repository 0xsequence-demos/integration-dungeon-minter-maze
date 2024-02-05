const express = require('express');
const path = require('path');
const app = express();

// Serve static files from the root directory
app.use(express.static(path.join(__dirname, '/')));

const port = 8002;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
