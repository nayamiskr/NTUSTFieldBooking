const EMPTY = {
    date: "未定日期",
    time: "未定時間",
    fullDate: "未定日期",
    numericDate: "未定日期",
    monthDay: "未定日期",
    weekday: "",
    weekdayShort: "",
    shortDate: "未定日期",
};

const pad = (value) => String(value).padStart(2, "0");

// 轉換各種日期格式。
export const formatDateTime = (value, options = {}) => {
    if (value === null || value === undefined || value === "") return EMPTY;

    if (options.input === "hour") {
        const hour = Number(value);
        return Number.isInteger(hour) && hour >= 0 && hour <= 24
            ? { ...EMPTY, time: `${pad(hour)}:00` } : EMPTY;
    }

    if (typeof value === "string") {
        const clock = value.trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?$/);
        if (clock) {
            const hour = Number(clock[1]);
            const minute = Number(clock[2]);
            const second = Number(clock[3] || 0);
            return hour <= 24 && minute <= 59 && second <= 59 && (hour !== 24 || (minute === 0 && second === 0))
                ? { ...EMPTY, time: `${pad(hour)}:${pad(minute)}` } : EMPTY;
        }
    }

    let dateTime;
    if (value instanceof Date) {
        dateTime = value;
    } else if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
        const [year, month, day] = value.split("-").map(Number);
        dateTime = new Date(year, month - 1, day);
        if (dateTime.getFullYear() !== year || dateTime.getMonth() + 1 !== month || dateTime.getDate() !== day) return EMPTY;
    } else {
        dateTime = new Date(value);
    }
    if (Number.isNaN(dateTime.getTime())) return EMPTY;

    const date = new Intl.DateTimeFormat("zh-TW", {
        month: "long", day: "numeric", weekday: "long",
    }).format(dateTime);
    const fullDate = new Intl.DateTimeFormat("zh-TW", {
        year: "numeric", month: "long", day: "numeric",
    }).format(dateTime);
    const time = new Intl.DateTimeFormat("zh-TW", {
        hour: "2-digit", minute: "2-digit", hourCycle: "h23",
    }).format(dateTime);
    const numericDate = `${dateTime.getFullYear()}/${pad(dateTime.getMonth() + 1)}/${pad(dateTime.getDate())}`;
    const monthDay = `${dateTime.getMonth() + 1}/${dateTime.getDate()}`;
    const weekdayShort = ["日", "一", "二", "三", "四", "五", "六"][dateTime.getDay()];
    const weekday = `週${weekdayShort}`;
    const shortDate = `${monthDay}（${weekday}）`;

    return { date, time, fullDate, numericDate, monthDay, weekday, weekdayShort, shortDate };
};
