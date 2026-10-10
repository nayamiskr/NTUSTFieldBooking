const errorText = (value) => {
    if (typeof value === "string") return value.trim();
    if (Array.isArray(value)) return value.map(errorText).filter(Boolean).join("；");
    if (value && typeof value === "object") return errorText(value.message || value.msg || value.detail);
    return "";
};

export function describePickUpJoinError(error) {
    const data = error?.response?.data;
    const status = error?.response?.status;
    const message = [data?.message, data?.error, data?.detail].map(errorText).find(Boolean) || "";
    const code = [data?.code, data?.error_code, data?.error?.code].filter((value) => typeof value === "string").join(" ");
    const reason = `${code} ${message}`.toLowerCase();

    if (/time[_\s-]?conflict|時間衝突/.test(reason)) {
        return { title: "報名時間衝突", message: "此時間段已有報名活動。" };
    }
    if (/deadline|registration.*(?:closed|ended|expired)|group.*(?:ended|expired)|報名.*截止/.test(reason)) {
        return { title: "活動報名已截止", message: "這個臨打團已超過報名截止時間，無法再報名。", refresh: true, closeDialog: true };
    }
    if (/fully[_\s-]?booked|(?:group|event)[_\s-]+(?:is[_\s-]+)?full\b|capacity[_\s-]?(?:exceeded|full)|not enough (?:remaining )?(?:slots|seats|capacity)|名額不足|已?額滿/.test(reason)) {
        return { title: "名額不足", message: "剩餘名額不足以完成此次報名，請重新整理後調整人數。", refresh: true };
    }
    if (/already.*(?:booked|registered|joined)|duplicate.*(?:order|registration)|已(?:報名|預約)/.test(reason)) {
        return { title: "已經報名", message: "你已報名這個臨打團，請到我的預約查看。", refresh: true };
    }
    if (status === 401) return { title: "登入已失效", message: "請重新登入後再報名。" };
    if (status === 403) return { title: "無法報名", message: "目前的帳號沒有報名權限。" };
    if (status === 404) return { title: "活動不存在", message: "找不到這個臨打團，請重新整理列表。", refresh: true };
    if (!error?.response) return { title: "連線失敗", message: "無法送出報名，請檢查網路連線後再試。" };
    if (status >= 500) return { title: "報名失敗", message: "系統暫時無法處理報名，請稍後再試。" };
    return { title: "報名失敗", message: message || "無法完成報名，請稍後再試。" };
}
