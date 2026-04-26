const express = require("express");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const FILE = "scores.json";

// 起動時ロード
let scores = [];
if (fs.existsSync(FILE)) {
  scores = JSON.parse(fs.readFileSync(FILE, "utf-8"));
} else {
  fs.writeFileSync(FILE, "[]");
}

// 保存関数
function save() {
  fs.writeFileSync(FILE, JSON.stringify(scores, null, 2));
}

// 🏆 スコア送信（同名は上書き・ベスト更新）
app.post("/score", (req, res) => {
  const { name, score } = req.body;

  if (!name || typeof score !== "number") {
    return res.status(400).json({ error: "invalid" });
  }

  const index = scores.findIndex(s => s.name === name);

  if (index !== -1) {
    // 既存 → ベスト更新
    if (score > scores[index].score) {
      scores[index].score = score;
    }
  } else {
    // 新規
    scores.push({ name, score });
  }

  // 🔥 同スコアなら最新優先 + 高い順
  scores.sort((a, b) => {
    if (b.score === a.score) return 0; // 同スコアは順序維持（最新優先）
    return b.score - a.score;
  });

  // 上位50だけ保存
  scores = scores.slice(0, 50);

  save();

  res.json({ ok: true });
});

// 📊 ランキング取得
app.get("/ranking", (req, res) => {
  res.json(scores);
});

// 起動
app.listen(3000, () => {
  console.log("server running on 3000");
});