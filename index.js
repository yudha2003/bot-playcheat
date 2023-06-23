const {
  Client,
  Location,
  List,
  Buttons,
  LocalAuth,
} = require("whatsapp-web.js");
const axios = require("axios");
const qrcode = require("qrcode-terminal");
const client = new Client({
  authStrategy: new LocalAuth(),
  // proxyAuthentication: { username: 'username', password: 'password' },
  puppeteer: {
    // args: ['--proxy-server=proxy-server-that-requires-authentication.example.com'],
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--no-first-run",
      "--no-zygote",
      "--single-process", // <- this one doesn't works in Windows
      "--disable-gpu",
    ],
  },
});

client.initialize();

client.on("loading_screen", (percent, message) => {
  console.log("LOADING SCREEN", percent, message);
});

client.on("qr", (qr) => {
  // NOTE: This event will not be fired if a session is specified.
  console.log("QR RECEIVED", qr);
  qrcode.generate(qr, { small: true });
});

client.on("authenticated", () => {
  console.log("AUTHENTICATED");
});

client.on("auth_failure", (msg) => {
  // Fired if session restore was unsuccessful
  console.error("AUTHENTICATION FAILURE", msg);
});

client.on("ready", () => {
  console.log("READY");
});

client.on("message", async (msg) => {
  var from = msg.from;
  var message = msg.body;
  var data = {
    number: from,
    message: message,
  };
  var data = JSON.stringify(data);
  axios
    .post("https://playcheat.tech/api/bot-whatsapp", data, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then(function (response) {
      var data = response.data;
      if (data.status == true) {
        msg.reply(data.message);
      }
    })
    .catch(function (error) {});
});

client.on("message_create", (msg) => {
  // Fired on all message creations, including your own
  if (msg.fromMe) {
    // do stuff here
  }
});

client.on("message_revoke_everyone", async (after, before) => {
  // Fired whenever a message is deleted by anyone (including you)
  console.log(after); // message after it was deleted.
  if (before) {
    console.log(before); // message before it was deleted.
  }
});

client.on("message_revoke_me", async (msg) => {
  // Fired whenever a message is only deleted in your own view.
  console.log(msg.body); // message before it was deleted.
});

client.on("message_ack", (msg, ack) => {
  /*
        == ACK VALUES ==
        ACK_ERROR: -1
        ACK_PENDING: 0
        ACK_SERVER: 1
        ACK_DEVICE: 2
        ACK_READ: 3
        ACK_PLAYED: 4
    */

  if (ack == 3) {
    // The message was read
  }
});
  /**
   * Information about the {@name message}:
   *
   * 1. If a notification was emitted due to a group participant changing their phone number:
   * {@name message.author} is a participant's id before the change.
   * {@name message.recipients[0]} is a participant's id after the change (a new one).
   *
   * 1.1 If the contact who changed their number WAS in the current user's contact list at the time of the change:
   * {@name message.to} is a group chat id the event was emitted in.
   * {@name message.from} is a current user's id that got an notification message in the group.
   * Also the {@name message.fromMe} is TRUE.
   *
   * 1.2 Otherwise:
   * {@name message.from} is a group chat id the event was emitted in.
   * {@name message.to} is @type {undefined}.
   * Also {@name message.fromMe} is FALSE.
   *
   * 2. If a notification was emitted due to a contact changing their phone number:
   * {@name message.templateParams} is an array of two user's ids:
   * the old (before the change) and a new one, stored in alphabetical order.
   * {@name message.from} is a current user's id that has a chat with a user,
   * whos phone number was changed.
**/
