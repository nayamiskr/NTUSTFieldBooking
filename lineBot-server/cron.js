const cron = require("node-cron");
const line = require("@line/bot-sdk");

const { getGroups } = require("./service/groupListMethod");
const { createPickupCarousel } = require("./components/groupFlexMessage");

require("dotenv").config();

const client = new line.messagingApi.MessagingApiClient({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN.trim(),
});

cron.schedule(
  "51 14 * * *",
  async () => {
    const groups = await getGroups(23, 120, "超酷羽球協會");

    await client.broadcast({
      messages: [
        {
          type: "text",
          text: "大家早安！今天的臨打團清單已經更新囉，快來看看有沒有想打的場次！",
        },
        createPickupCarousel(groups),
      ],
    });
  },
  {
    scheduled: true,
    timezone: "Asia/Taipei",
  },
);