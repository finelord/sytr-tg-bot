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
      const startToken = '<meta property="description" content="';
      const endToken = '">';
      const start = response.data.indexOf(startToken) + startToken.length;
      const end = response.data.indexOf(endToken, start);
      if (~start && ~end) {
        const title = response.data.slice(start, end);
        console.log(title);

        const primary = title.split(',')[0]
          .replace('on Spotify', '')
          .trim();
        const secondary = (title.split(',')[1] || '')
          .replace('a song by', '')
          .replace('an album by', '')
          .replace('Category: Artist', '')
          .replace('on Spotify', '')
          .trim();
        console.log(primary);
        console.log(secondary);

        if (primary) {
          const query = (`${primary} ${secondary}`).trim();
          const queryEncoded = encodeURI(query);
          bot.sendMessage(
            chatId,
            `Search *${query}* on:\n[Yandex Music](https://music.yandex.ru/search?text=${queryEncoded}) | [Deezer](https://www.deezer.com/search/${queryEncoded}) | [Youtube](https://www.youtube.com/results?search_query=${queryEncoded}) | [Google](https://www.google.com/search?q=${queryEncoded})`,
            {
              parse_mode: 'Markdown',
              disable_web_page_preview: true
            }
          );
        }
      }
    });
  }
});
