import api from "../baseApi"

export const registerService = {
    registerAccount: async ({ email, password, display_name }) => {
        try {
            const res = await api.post("/auth/register", { email, password, display_name });
            return res;
        } catch (error) {
            throw error;
        }
    }
}