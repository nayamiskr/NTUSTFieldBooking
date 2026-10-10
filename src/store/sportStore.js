import { create } from "zustand";

// 登入與所有登入後頁面共用球類，沿用既有的儲存欄位。
export const useSportStore = create((set) => ({
    sportId: localStorage.getItem("sportType"),
    setSportId: (sportId) => {
        if (!sportId) return;
        localStorage.setItem("sportType", sportId);
        set({ sportId });
    },
}));
