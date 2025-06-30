const axios = require("axios");

const ENDPOINT =
  "https://api-bo-shbet.khuyenmaiapp.com/jpk-bo/sendMessage?site=shbet";

async function sendConfirmMail({ account, subject, content }) {
  try {
    const response = await axios.post(`${ENDPOINT}`, {
      account,
      subject,
      content,
    });
    return response;
  } catch (e) {
    throw new Error("GPK API Error");
  }
}

module.exports = { sendConfirmMail };
