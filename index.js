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
      const startTitleToken = '<meta property="og:title" content="';
      const endTitleToken = '" />';
      const title = getValue(response.data, startTitleToken, endTitleToken);
      console.log(title);

      const startArtistToken = '<h1>More by ';
      const endArtistToken = '</h1>';
      const artist = getValue(response.data, startArtistToken, endArtistToken);
      console.log(artist);

      if (title || artist) {
        const query = (`${title} ${artist}`).trim();
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
    });
  }
});

function getValue(data, startToken, endToken) {
  const start = data.indexOf(startToken) + startToken.length;
  const end = data.indexOf(endToken, start);
  if (~start && ~end) {
    return data.slice(start, end);
  }
  return '';
}
