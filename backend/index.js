const express = require('express');
const cors = require('cors');
const queryRoutes = require('./routes/queryRoutes');
require('dotenv').config();

const app = express();
app.use(cors(
  {
    origin:["https://duckdbdemo.vercel.app"],
    methods:["POST", "GET"],
    credentials:true
  }
));
app.use(express.json());

app.use('/api', queryRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on PORT: ${PORT}`);
});
