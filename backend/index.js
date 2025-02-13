const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5001; //  Uses Render's dynamic port

// ✅ Fix: CORS to allow frontend
app.use(
  cors({
    origin: ["https://news-aggregator-fe.onrender.com"], // Allow only your frontend
    methods: ["GET"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json()); // Allows JSON body parsing

// ✅ Route to fetch news articles
app.get("/api/news", async (req, res) => {
  const { category, search, page } = req.query;
  const API_KEY = process.env.NEWS_API_KEY;

  let url = "";

  if (search) {
    url = `https://newsapi.org/v2/everything?q=${search}&page=${page || 1}&apiKey=${API_KEY}`;
  } else {
    url = `https://newsapi.org/v2/top-headlines?category=${category}&country=us&page=${page || 1}&apiKey=${API_KEY}`;
  }

  try {
    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching news:", error); // Log the error for debugging
    res.status(500).json({ error: "Failed to fetch news" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
