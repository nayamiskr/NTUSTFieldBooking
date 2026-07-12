import { create } from "zustand";

export const useAuthStore = create((set) => ({
    token: null,
    userId: null,

    setAuth: (data) => set({
        token: data.access_token,
        userId: data.user.id,
    }),

    setLogout: () => set({
        token: null,
        userId: null,
    })
}))

