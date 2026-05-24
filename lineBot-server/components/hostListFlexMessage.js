const hostListFlexMessage = (hostName, lat, lon) => ({
    type: "bubble",
    size: "micro",
    body: {
        type: "box",
        layout: "vertical",
        contents: [
            { type: "text", text: "主辨人", weight: "bold", size: "md", wrap: true },
            { type: "text", text: hostName, size: "xs", color: "#666666", wrap: true }
        ]
    },
    footer: {
        type: "box",
        layout: "vertical",
        contents: [
            {
                type: "button",
                height: "sm",
                style: "link",
                action: {
                    type: "postback",
                    label: "查看臨打團",
                    data: `action=searchGroup&host=${hostName}&lat=${lat}&lon=${lon}`,
                    text: `為您搜尋${hostName}的臨打團，請稍等`
                }
            }
        ]
    }
})

export const createHostListCarousel = (hostList, lat, lon) => ({
    type: "flex",
    altText: "主辦人清單",
    contents: {
        type: "carousel",
        contents: hostList.slice(0, 10).map(name => hostListFlexMessage(name, lat, lon))
    }
});