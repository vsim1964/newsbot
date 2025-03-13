require('dotenv').config();
const { Telegraf } = require('telegraf');
const Parser = require('rss-parser');

const bot = new Telegraf(process.env.NEWSBOT_TOKEN);
const parser = new Parser();

// Список источников
const RSS_FEEDS = {
	'РИА Новости': 'https://ria.ru/export/rss2/archive/index.xml',
	'РБК': 'https://rssexport.rbc.ru/rbcnews/news/30/full.rss',
	'ТАСС': 'https://tass.ru/rss/v2.xml',
	'Лента.ру': 'https://lenta.ru/rss/news',
	'Коммерсантъ': 'https://www.kommersant.ru/RSS/news.xml'
};

// Функция для получения новостей из всех источников
async function getAllNews() {
	let news = [];

	for (const [source, url] of Object.entries(RSS_FEEDS)) {
		try {
			const feed = await parser.parseURL(url);
			const articles = feed.items.slice(0, 2).map(item => `📌 *${source}*\n${item.title}\n${item.link}`);
			news.push(...articles);
		} catch (error) {
			console.error(`Ошибка загрузки ${source}:`, error.message);
		}
	}

	return news.length > 0 ? news.join("\n\n") : "❌ Не удалось загрузить новости.";
}

// Команда /news для получения новостей из всех источников
bot.command('news', async (ctx) => {
	ctx.reply('⏳ Загружаю свежие новости...');
	try {
		const news = await getAllNews();
		ctx.replyWithMarkdown(news);
	} catch (error) {
		ctx.reply('❌ Ошибка при получении новостей.');
	}
});

bot.start((ctx) => ctx.reply('Привет! Я бот-агрегатор новостей. Используй /news, чтобы получить свежие новости.'));

bot.launch();
console.log('📰 Бот запущен!');
