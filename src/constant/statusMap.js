export const statusMap = {
    pending: {
        label: "待審核",
        class: "bg-yellow-500 cursor-not-allowed opacity-80",
    },
    confirmed: {
        label: "已確認",
        class: "bg-green-500 cursor-not-allowed opacity-80",
    },
    cancelled: {
        label: "已取消",
        class: "bg-gray-100 text-gray-800 border border-gray-300"
    },
    cancel_requested: {
        label: "取消申請中",
        class: "bg-red-100 text-red-800 border border-red-300"
    }
};