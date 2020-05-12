const { Telegraf } = require("telegraf");
const { Agent } = require("https");

const { token } = require("./config");
const agent = new Agent({ keepAlive: true, maxFreeSockets: 5 });
const pdBot = new Telegraf(token, { agent });

const gameMap = new Map();

pdBot.catch((err, ctx) => {
	console.error(`Encountered an error: ${ctx.updateType}`, err);
});
/*
pdBot.start((ctx) => {
	// start command
});
*/
pdBot.command(["new", "newgame", "startgame"], (ctx) => {
	if (gameMap.includes(ctx.message.from.id)) {
		return ctx.reply("A game has already been started!");
	} else {
		gameMap.append(ctx.message.from.id);
	}
	ctx.reply("A new game has started!");
	// put an inline query answer here
	return null;
});

pdBot.action("joinGame", async (ctx) => {
	await ctx.answerCbQuery();
	await ctx.editMessageText(`${ctx.message.text}\n${ctx.message.from.id}`);
});


pdBot.launch();
/*
bot.onText(/\/new/, (msg) => {
	newGame = [];
	bot.sendMessage(
		msg.chat.id,
		"<b>A new game has started!</b>\nPlayers:",
		{
			reply_markup: {
				inline_keyboard: [[
					{
						text: 'Join Game',
						callback_data: 'join_game'
					}
				]]
			},
			parse_mode: "HTML"
		}
	)
	//bot.answer_inline_query('join_game', [], cache_time=300, is_personal=True, switch_pm_text="Hi");

});

// listener for join game
bot.on('callback_query', (callbackQuery) => {
	const msg = callbackQuery.message;
	const player = callbackQuery.from.first_name;

	if(newGame.includes(player)) {
		return bot.sendMessage(msg.chat.id, `You already joined this game ${player}!`);
	}

	if(newGame.length < 2){
		newGame.push(player);
		console.log(callbackQuery);
		bot.editMessageText(msg.text + `\n${player}`, {
			chat_id: msg.chat.id,
			message_id: msg.message_id,
			reply_markup: msg.reply_markup
		});
		return bot.sendMessage(msg.chat.id, `${player} has joined the game!`);
	} else {

	}
});

*/
