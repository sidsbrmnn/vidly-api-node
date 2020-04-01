const express = require('express');

const app = express();

const PORT = parseInt(process.env.PORT, 10) || 3000;
app.listen(PORT, () => {
    console.log('Listening on port:', PORT);
});
