const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

const zapierWebhookUrl = 'https://hooks.zapier.com/hooks/catch/23177519/uoitjli/';

// Slackは application/x-www-form-urlencoded で送ってくる
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/slack/actions', async (req, res) => {
  try {
    const payload = JSON.parse(req.body.payload);
    const action = payload.actions?.[0];

    if (payload.type === 'block_actions' && action?.action_id === 'done') {
      console.log('✅ 完了ボタンが押されました');
      console.log('▶ 現場情報:', action.value);

      const token = process.env.SLACK_BOT_TOKEN;

      // ▼ 値を分割して各要素を取得
      const [genba, deadline, tantou] = action.value.split('|');
      const notifyUser = '<@ULLR1PF7W>';
      const key = `genba_${genba}`;
      const value = 'done';

      // ✅ ① スタンプを付ける
      await axios.post('https://slack.com/api/reactions.add', {
        channel: payload.channel.id,
        name: 'white_check_mark',
        timestamp: payload.message.ts
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // ✅ ② スレッド返信
      await axios.post('https://slack.com/api/chat.postMessage', {
        channel: payload.channel.id,
        thread_ts: payload.message.ts,
        text:
          `✅ 担当者が完了報告をしました！\n\n` +
          `*現場名*: ${genba}\n` +
          `*〆切日*: ${deadline}\n` +
          `*担当者*: ${tantou}\n\n` +
          `${notifyUser} さんにも通知しました。`
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // ✅ ③ Zapierに送信（無料プラン対応）
      await axios.post(zapierWebhookUrl, { key, value });
      console.log(`📤 Zapierに送信: ${key} = ${value}`);
    }

    res.status(200).send();
  } catch (e) {
    console.error('❌ エラー:', e);
    res.status(500).send();
  }
});

app.get('/', (req, res) => {
  res.send('✅ サーバー稼働中');
});

app.listen(PORT, () => {
  console.log(`✅ サーバー起動完了！PORT: ${PORT}`);
});
