import api from "../baseApi"

export const registerService = {
    registerAccount: async ({ email, username, password, display_name, gender, birth_date }) => {
        try {
            const res = await api.post("/auth/register", { email, username, password, display_name, gender, birth_date });
            return res;
        } catch (error) {
            throw error;
        }
    }
}
