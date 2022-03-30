const express = require('express');
const app = express();
const PORT = 3000;

app.use('/', require('./routes'));

app.listen(PORT, () => {
  console.log(`Server started at port: ${PORT}`);
});