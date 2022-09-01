/**
 *
 */

const bot_token = process.argv[2];

if(!bot_token) throw new Error("pleas start this script this your bot token as the first argument.");

const TelegramBot = require('node-telegram-bot-api');
const dayjs = require('dayjs');

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(bot_token, { polling: true });

const cron = require('node-cron');
let msg_storage = [];

// Listen for any kind of message. There are different kinds of
// messages.
// TESTING STUFF ...
bot.on('callback_query', (msg) => {

    console.log(msg)

});

bot.onText(/^\/start$/, (msg) => {
    bot.sendMessage(msg.chat.id, `Hey send me a timestamp and i can say u the offset.\n\n\/start_YYYY[MM[DD[HH[mm]]]]\n\/start_${dayjs().format('YYYYMMDD')}\n\n...äääähhhhh .... local time in germany ... sorry`);
});

bot.onText(/^\/now$/, (msg) => {
    sendEasy(msg.chat.id, [null, dayjs().format('YYYYMMDDHHmm')], "YYYYMMDDHHmm", msg.date);
});

// ^\d{4}[0-2]\d[0-3]\d[0-2]\d[0-5]\d$

bot.onText(/^\/start[_, ](:?\d{4})$/, (msg, reg) => {
    sendEasy(msg.chat.id, reg, "YYYY", msg.date);
});

bot.onText(/^\/start[_, ](:?\d{4}[0-2]\d)$/, (msg, reg) => {
    sendEasy(msg.chat.id, reg, "YYYYMM", msg.date);
});

bot.onText(/^\/start[_, ](:?\d{4}[0-2]\d[0-3]\d)$/, (msg, reg) => {
    sendEasy(msg.chat.id, reg, "YYYYMMDD", msg.date);
});

bot.onText(/^\/start[_, ](:?\d{4}[0-2]\d[0-3]\d[0-2]\d)$/, (msg, reg) => {
    sendEasy(msg.chat.id, reg, "YYYYMMDDHH", msg.date);
});

bot.onText(/^\/start[_, ](:?\d{4}[0-2]\d[0-3]\d[0-2]\d[0-5]\d)$/, (msg, reg) => {
    sendEasy(msg.chat.id, reg, "YYYYMMDDHHmm", msg.date);
});

function ms2array(ms) {
    if(ms < 0) ms = ms * -1;
    let arr = [];
    // 0, 1, 2, 3, 4, 5
    // y, d, h, m, s, ms
    arr[5] = parseInt((ms % 1000) / 100);
    ms = parseInt(ms / 1000);
    arr[4] = parseInt(ms % 60);
    ms = parseInt(ms / 60);
    arr[3] = parseInt(ms % 60);
    ms = parseInt(ms / 60);
    arr[2] = parseInt(ms % 24);
    ms = parseInt(ms / 24);
    // arr[1] = parseInt(ms);
    arr[1] = parseInt(ms % 365);
    ms = parseInt(ms / 365);
    arr[0] = parseInt(ms);
    return arr;
}

function sendEasy(chat_id, reg, format, now) {

    bot.sendMessage(chat_id, getMessageString(reg, format, now))
        .then((msg) => {
            msg_storage.push({ sending: { chat_id, reg, format, now }, feedback: msg });
        })
        .catch(sendingError => {
            console.error("There was a error while sendiung and save the message.", sendingError);
        });
}

function getMessageString(reg, format, now) {
    const past = "🔙 ";
    const future = "🔜 ";

    const dif = dayjs(reg[1], format).diff(dayjs.unix(now));
    const duration = ms2array(dif);
    let str = dif > 0 ? future : past;
    if(duration[0] > 0) str += duration[0] + "Y ";
    if(duration[1] > 0) str += duration[1] + "D ";
    str += ('' + duration[2]).padStart(2, '0') + ":";
    str += ('' + duration[3]).padStart(2, '0');

    return str + '\n\/start_' + reg[1];
}


// here comes the loop for msg edit
cron.schedule('* * * * *', () => { // every minute

    setTimeout(runningEveryMinute, 1 * 1000);

});

function runningEveryMinute() {

    // cleaning up old stuff
    // deleting entries after 1 day

    msg_storage = msg_storage.filter((msg) => {

        if(dayjs().isBefore(dayjs.unix(msg.feedback.date).add(3, 'minutes'))) {
            return true; // all fine ...
        }

        // this is out ...
        // ☠️
        bot.editMessageText(
            msg.feedback.text + '\n☠️ no auto update anymore',
            {
                chat_id: msg.feedback.chat.id,
                message_id: msg.feedback.message_id
            }
        )
            .then(() => {

            })
            .catch(updateError => {
                console.error("There was a error while updating the message.", updateError);
            })

        return false;
    });

    msg_storage.forEach(data => {

        // get text
        const str = getMessageString(data.sending.reg, data.sending.format, Math.floor(Date.now() / 1000));

        // do not update, if the text is the same
        if(str == data.feedback.text) return;

        // update msg
        bot.editMessageText(str, { chat_id: data.feedback.chat.id, message_id: data.feedback.message_id })
            .then((new_feedback) => {
                data.feedback = new_feedback;
            })
            .catch(updateError => {
                console.error("There was a error while updating the message.", updateError);
            })
    });

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
