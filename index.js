const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000; // ← ここが重要！

app.use(bodyParser.json());

app.post('/slack/actions', (req, res) => {
  console.log('ボタンが押されました:', req.body);
  res.status(200).send(); // Slackに「OK」と返す
});

app.listen(PORT, () => {
  console.log(`✅ サーバー起動完了！PORT: ${PORT}`);
});
