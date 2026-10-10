export const formatHour24 = (hour) => `${String(hour).padStart(2, "0")}:00`;

export const formatClock24 = (value) => {
    const match = typeof value === "string" ? value.match(/^(\d{1,2}):(\d{2})/) : null;
    if (!match || Number(match[1]) > 24 || Number(match[2]) > 59) return "未提供";
    return `${match[1].padStart(2, "0")}:${match[2]}`;
};

export const formatTime24 = (value) => {
    if (!value) return "未定時間";
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return "未定時間";
    return new Intl.DateTimeFormat("zh-TW", {
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
    }).format(date);
};

export const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return { date: "未定日期", time: "未定時間" };

    const d = dateTimeString instanceof Date ? dateTimeString : new Date(dateTimeString);
    if (Number.isNaN(d.getTime())) return { date: "未定日期", time: "未定時間" };

    const date = d.toLocaleDateString('zh-TW', {
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    });

    const time = formatTime24(d);

    return { date, time };
}
