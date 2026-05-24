const groupsFlexMessage = (groups) => ({
    type: "bubble",
    size: "micro",
    body: {
        type: "box",
        layout: "vertical",
        contents: [
            { type: "text", text: groups.title, weight: "bold", size: "md", wrap: true },
            {
                type: "box",
                layout: "vertical",
                margin: "md",
                contents: [
                    { type: "text", text: `${groups.location.name}`, size: "xs", color: "#666666", wrap: true },
                    { type: "text", text: `日期: ${groups.date}`, size: "xs", color: "#666666" },
                    { type: "text", text: `時間: ${groups.time}`, size: "xs", color: "#666666" },
                    { type: "text", text: `費用: ${groups.fee}`, size: "xs", color: "#666666" },
                    { type: "text", text: `人數: ${groups.current_enrolled}/${groups.capacity}`, size: "xs", color: "#666666" },
                    { type: "text", text: `程度: ${groups.skill_level}`, size: "xs", color: "#666666" }
                ]
            },
        ]
    },
    footer: {
        type: "box", 
        layout: "vertical",
        contents: [
            {
                type: "button",
                action: {
                    type: "postback",
                    label: "報名臨打團",
                    data: `action=joinGroup&groupId=${groups.id}`,
                },
                style: "primary",
                height: "sm"
            }
        ]
    }
});

export const createPickupCarousel = (groups) => ({
  type: "flex",
  altText: "今日臨打清單",
  contents: {
    type: "carousel",
    contents: groups.slice(0, 10).map(groupsFlexMessage)
  }
});
