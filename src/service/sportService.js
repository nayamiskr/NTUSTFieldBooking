import api from "../baseApi.js";

let cachedSportList;
let pendingSportList;

export const sportService = {
    // 取得運動種類清單
    getSportList: () => {
        if (cachedSportList !== undefined) return Promise.resolve(cachedSportList);
        if (!pendingSportList) {
            pendingSportList = api.get("/sports")
                .then((res) => {
                    cachedSportList = res.data;
                    return cachedSportList;
                })
                .finally(() => { pendingSportList = null; });
        }
        return pendingSportList;
    },

    getSportById: async (sportId) => {
        const res = await api.get(`/sports/${sportId}`);
        return res.data;
    }
}
