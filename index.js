/**
 *
 */

const bot_token = process.argv[2];

if(!bot_token) throw new Error("pleas start this script this your bot token as the first argument.");

const TelegramBot = require('node-telegram-bot-api');
const dayjs = require('dayjs');
dayjs.locale('de');
dayjs.extend(require('dayjs/plugin/relativeTime'), {
    rounding: (x => Math.round(x*100)/100)
});

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(bot_token, { polling: true });

// Listen for any kind of message. There are different kinds of
// messages.
bot.on('callback_query', (msg) => {

    console.log(msg)

});

bot.onText(/^\/start$/, (msg) => {
    bot.sendMessage(msg.chat.id, `Hey send me a timestamp and i can say u the offset.\n\n\/start_YYYY[MM[DD[HH[mm]]]]\n\n\n...äääähhhhh .... local time in germany ... sorry`);
});

// ^\d{4}[0-2]\d[0-3]\d[0-2]\d[0-5]\d$

bot.onText(/^\/start[_, ](:?\d{4})$/, (msg, reg) => {
    sendEasy(msg.chat.id, reg, "YYYY");
});

bot.onText(/^\/start[_, ](:?\d{4}[0-2]\d)$/, (msg, reg) => {
    sendEasy(msg.chat.id, reg, "YYYYMM");
});

bot.onText(/^\/start[_, ](:?\d{4}[0-2]\d[0-3]\d)$/, (msg, reg) => {
    sendEasy(msg.chat.id, reg, "YYYYMMDD");
});

bot.onText(/^\/start[_, ](:?\d{4}[0-2]\d[0-3]\d[0-2]\d)$/, (msg, reg) => {
    sendEasy(msg.chat.id, reg, "YYYYMMDDHH");
});

bot.onText(/^\/start[_, ](:?\d{4}[0-2]\d[0-3]\d[0-2]\d[0-5]\d)$/, (msg, reg) => {
    sendEasy(msg.chat.id, reg, "YYYYMMDDHHmm");
});

function sendEasy(chat_id, reg, format){
    bot.sendMessage(chat_id, dayjs(reg[1], format).fromNow() + '\n' + reg[0]);
}



// errors ... sad
bot.on('polling_error', function (err) {
    console.error('polling_error', err);
})
bot.on('webhook_error', function (err) {
    console.error('webhook_error', err);
})
bot.on('error', function (err) {
    console.error('error', err);
})
