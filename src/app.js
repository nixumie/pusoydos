const { Telegraf } = require("telegraf");
const { Agent } = require("https");
const { inspect } = require("util");
const Markup = require("telegraf/markup");

const { token, owners } = require("./config");
const agent = new Agent({ keepAlive: true, maxFreeSockets: 5 });
const pdBot = new Telegraf(token, { agent });

const gameMap = new Map();

pdBot.catch((err, ctx) => {
	console.error(`Encountered an error: ${ctx.updateType}`, err);
});

pdBot.start((ctx) => {
	ctx.reply("Hello! Thanks for using Pusoy Dos Bot! To start a new game, please use the command /new on a group or channel.");
});

pdBot.command(["new", "newgame", "startgame"], (ctx) => {
	if (ctx.chat.type === "private") return ctx.reply("You cannot start a game on a private channel.");
	if (gameMap.has(ctx.chat.id)) return ctx.reply("A game has already been started!");

	if (!gameMap.has(ctx.chat.id)) {
		gameMap.set(ctx.chat.id, { players: [] });
		ctx.reply("A new game has been started!");
	}

	ctx.replyWithHTML("<b>Players</b>", Markup.inlineKeyboard([Markup.callbackButton("Join Game", "joinGame")]).extra());
	// put an inline query answer here
	return null;
});

pdBot.command("eval", async (ctx) => {
	if (!owners.includes(ctx.from.id)) return ctx.reply("You do not have permission to use this command.");
	let evaled;
	try {
		evaled = eval(ctx.message.text.split(" ").slice(1).join(" "));
		evaled = evaled instanceof Promise ? inspect(await evaled, { showHidden: true, depth: 0 }) : inspect(evaled, { showHidden: true, depth: 0 });
	} catch (error) {
		evaled = error.stack;
	}
	return ctx.replyWithMarkdown(`\`\`\`\n${evaled}\n\`\`\``);
});

pdBot.action("joinGame", (ctx) => {
	const playerName = ctx.from.username ? ctx.from.username : ctx.from.last_name ? `${ctx.from.first_name} ${ctx.from.last_name}` : ctx.from.first_name;
	if (gameMap.get(ctx.chat.id).players.some(player => ctx.from.id === player.id)) {
		return ctx.replyWithHTML(`<a href="tg://user?id=${ctx.from.id}">${playerName}</a>, you already joined this game.`);
	}

	// add user to array of players
	gameMap.get(ctx.chat.id).players.push(ctx.from);
	// start game
	if (gameMap.get(ctx.chat.id).players.length === 4) {
		ctx.editMessageText(`${ctx.update.callback_query.message.text}\n✔ ${playerName}`); // eslint-disable-line max-len
		return ctx.reply("Starting game");
	}
	return ctx.editMessageText(`${ctx.update.callback_query.message.text}\n✔ ${playerName}`, Markup.inlineKeyboard([Markup.callbackButton("Join Game", "joinGame")]).extra());
});

pdBot.launch();
