const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const token = process.env.TOKEN;
if (!token) {
    console.log('Error: no token provided');
    process.exit();
}

const bot = new TelegramBot(token, {polling: true});

bot.onText(/\/echo (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const resp = match[1];
  bot.sendMessage(chatId, resp);
});

bot.on('message', (msg) => {
  console.log(msg);

  const chatId = msg.chat.id;

  if (String(msg.text).startsWith('https://open.spotify.com/')) {
    const url = msg.text.slice(0, msg.entities[0].length);
    console.log(url);

    axios.get(url).then(response => {
      const start = response.data.indexOf('<title>');
      const end = response.data.indexOf('</title>');
      if (~start && ~end) {
        const title = response.data.slice(start + 7, end);
        console.log(title);

        const primary = title.split(',')[0]
          .replace('on Spotify', '')
          .trim();
        const secondary = (title.split(',')[1] || '')
          .replace('a song by', '')
          .replace('on Spotify', '')
          .trim();
        console.log(primary);
        console.log(secondary);

        if (primary) {
          const query = encodeURI(`${primary} ${secondary}`);
          bot.sendMessage(
            chatId,
            `https://music.yandex.ru/search?text=${query}`
          );
        }
      }
    });
  }
});