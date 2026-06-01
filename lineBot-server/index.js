const express = require("express");
const line = require("@line/bot-sdk");

const {
  getGroups,
  getHostLists,
  addGroup,
} = require("./service/groupListMethod");
const { createPickupCarousel } = require("./components/groupFlexMessage");
const { createHostListCarousel } = require("./components/hostListFlexMessage");

require("dotenv").config();
require("./cron.js");

const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

const app = express();

// LINE Webhook 路由
app.post("/webhook", line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

const client = new line.messagingApi.MessagingApiClient({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN.trim(),
});

let groups = [];

async function handleEvent(event) {
  if (event.type !== "message" && event.type !== "postback") {
    return Promise.resolve(null);
  }

  // 處理Message事件
  if (event.type === "message") {
    //先讓使用者分享位置去做定位，之後才顯示最近臨打團
    if (event.message.text === "顯示最近臨打") {
      try {
        const hostList = await getHostLists();
        const hostNames = Object.keys(hostList);
        groups = await getGroups(
          event.message.latitude,
          event.message.longitude,
        );

        if (!groups || groups.length === 0) {
          return client.replyMessage({
            replyToken: event.replyToken,
            messages: [{ type: "text", text: "目前沒有臨打團喔！" }],
          });
        }

        return client.replyMessage({
          replyToken: event.replyToken,
          messages: [
            createHostListCarousel(
              hostNames,
              event.message.latitude,
              event.message.longitude,
            ),
          ],
        });
      } catch (error) {
        //抓是不是沒有token，並跳轉至登入介面
        console.error("Error fetching pickup groups:", error);
        if (error.response && error.response.status === 401)
        {
          return client.replyMessage({
            replyToken: event.replyToken,
            messages: [
              {
                type: "template",
                altText: "請登入以使用功能",
                template: {
                  type: "buttons",
                  text: "請登入以使用功能",
                  actions: [
                    {
                      type: "uri",
                      label: "點我登入",
                      uri: "https://liff.line.me/2010177405-eZLEE6hK"
                    }
                  ]
                }
              }
            ]
          })
        }
        return client.replyMessage({
          replyToken: event.replyToken,
          messages: [
            { type: "text", text: "抱歉，無法取得臨打團資訊。請稍後再試。" },
          ],
        });
      }
    }
  }

  // 處理 postback 事件
  if (event.type === "postback") {
    const data = event.postback.data;
    const params = new URLSearchParams(data);
    const action = params.get("action");

    //以主辦人名稱顯示臨打團
    if (action === "searchGroup") {
      const params = new URLSearchParams(data);
      const hostName = params.get("host");
      const lat = parseFloat(params.get("lat"));
      const lon = parseFloat(params.get("lon"));

      groups = await getGroups(lat, lon, hostName);

      return client.replyMessage({
        replyToken: event.replyToken,
        messages: [createPickupCarousel(groups)],
      });
    }

    //加入臨打團
    if (action === "joinGroup") {
      const data = event.postback.data;
      const params = new URLSearchParams(data);
      const groupId = params.get("groupId");

      try {
        await addGroup(groupId);
        return client.replyMessage({
          replyToken: event.replyToken,
          messages: [
            { type: "text", text: "您的報名申請已提交，完成審核將通知您！" },
          ],
        });
      } catch (error) {
        console.error("Error joining group:", error);
        return client.replyMessage({
          replyToken: event.replyToken,
          messages: [
            { type: "text", text: "抱歉，無法完成報名。請稍後再試。" },
          ],
        });
      }
    }

    //加入我的最愛
    if (action ===  "addFavorite") {
      const params = new URLSearchParams(data);
      const hostName = params.get("host");
      return client.replyMessage({
        replyToken: event.replyToken,
        messages: [
          { type: "text", text: `${hostName}已加入我的最愛！如果此團有空缺將定時通知您。` },
        ]
      })
    }
  }
}

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`伺服器已啟動，監聽連接埠: ${PORT}`);
});
