const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Slackは URLエンコード形式で送ってくるためこちらを使用
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/slack/actions', (req, res) => {
  try {
    const payload = JSON.parse(req.body.payload); // ← ここで中身を正しくパース

    const action = payload.actions?.[0];
    if (payload.type === 'block_actions' && action?.action_id === 'done') {
      console.log('✅ 完了ボタンが押されました');
      console.log('▶ 現場情報:', action.value); // 例: "現場名|〆切日|担当者"
    } else {
      console.log('📩 別のアクションが押されました:', action?.action_id);
    }

    res.status(200).send(); // Slackに成功応答
  } catch (e) {
    console.error('❌ payloadの解析に失敗しました', e);
    res.status(500).send();
  }
});

app.listen(PORT, () => {
  console.log(`✅ サーバー起動完了！PORT: ${PORT}`);
});
