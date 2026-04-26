export const formatDateTime = (dateTimeString) => {
    const dateDisplay = dateTimeString
        ? new Date(dateTimeString).toLocaleDateString('zh-TW', {
            month: 'long',
            day: 'numeric',
            weekday: 'long',
            hour: '2-digit',
            minute: '2-digit'
          })
        : "未定時間";
    return dateDisplay;
}