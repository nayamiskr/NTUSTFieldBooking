export const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return { date: "未定日期", time: "未定時間" };

    const d = new Date(dateTimeString);

    const date = d.toLocaleDateString('zh-TW', {
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    });

    const time = d.toLocaleTimeString('zh-TW', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });

    return { date, time };
}