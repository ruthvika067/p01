import express from "express";
import bodyParser from "body-parser";

const app = express();
const PORT = 3000;

// -----------------
// Middleware
// -----------------
app.use(bodyParser.json()); // for JSON POST
app.use(bodyParser.urlencoded({ extended: true })); // for form POST

// -----------------
// GET / → Welcome
// -----------------
app.get("/", (req, res) => {
  res.send("Welcome to the Coin Change DP API");
});

// -----------------
// GET /coin-change → HTML form
// -----------------
app.get("/coin-change", (req, res) => {
  res.send(`
    <h1>Coin Change DP Calculator</h1>
    <form method="POST" action="/coin-change">
      <label>Coins (comma separated): </label>
      <input type="text" name="coins" placeholder="e.g. 1,2,5" required /><br/><br/>
      <label>Amount: </label>
      <input type="number" name="amount" placeholder="e.g. 11" required /><br/><br/>
      <button type="submit">Calculate</button>
    </form>
  `);
});

// -----------------
// POST /coin-change → DP logic
// -----------------
app.post("/coin-change", (req, res) => {
  let coins = req.body.coins;
  let amount = req.body.amount;

  // Parse coins & amount if coming from HTML form
  if (typeof coins === "string") {
    coins = coins.split(",").map((c) => parseInt(c.trim()));
    amount = parseInt(amount);
  }

  // Validate input
  if (!Array.isArray(coins) || coins.some(isNaN)) {
    return res.send("Invalid coins! Enter numbers separated by commas.");
  }
  if (isNaN(amount) || amount < 0) {
    return res.send("Invalid amount! Enter a non-negative number.");
  }

  // Coin Change DP logic
  const dp = Array(amount + 1).fill(Infinity);
  dp[0] = 0;

  for (let i = 1; i <= amount; i++) {
    for (let coin of coins) {
      if (i - coin >= 0) {
        dp[i] = Math.min(dp[i], dp[i - coin] + 1);
      }
    }
  }

  const result = dp[amount] === Infinity ? -1 : dp[amount];

  // Respond HTML if form, else JSON
  const contentType = req.headers["content-type"];
  if (contentType && contentType.includes("application/x-www-form-urlencoded")) {
    res.send(`
      <h2>Minimum Coins Needed: ${result}</h2>
      <a href="/coin-change">Try Again</a>
    `);
  } else {
    res.json({ minimumCoins: result });
  }
});

// -----------------
// Start server
// -----------------
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Open http://localhost:${PORT}/coin-change to test the HTML form`);
});
