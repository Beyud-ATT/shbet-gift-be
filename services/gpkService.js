const axios = require("axios");

const { GPK_ENDPOINT } = process.env;

async function getCustomerInfo({ account }) {
  try {
    const response = await axios.get(`${GPK_ENDPOINT}/member/info-detail`, {
      headers: {
        "Content-Type": "application/json",
      },
      params: {
        site: process.env.SITE,
        account,
      },
    });
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

async function getSummaryAccount({ account, startTime, endTime }) {
  try {
    const response = await axios.post(
      `${GPK_ENDPOINT}/member/summary-account/?site=${process.env.SITE}`,
      {
        Account: account,
        PayoffTimeBegin: startTime,
        PayoffTimeEnd: endTime,
      },
    );
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

module.exports = {
  getCustomerInfo,
  getSummaryAccount,
};
