import { zhTWDictionary as dictionary } from "../locale/zh-TW/translate";

export const statusMap = {
    pending: {
        label: dictionary.pickUp.status.pending,
        class: "bg-yellow-500 cursor-not-allowed opacity-80",
    },
    confirmed: {
        label: dictionary.pickUp.status.confirmed,
        class: "bg-green-500 cursor-not-allowed opacity-80",
    },
    cancelled: {
        label: dictionary.pickUp.status.cancelled,
        class: "bg-gray-100 text-gray-800 border border-gray-300"
    },
    cancel_requested: {
        label: dictionary.pickUp.status.cancel_requested,
        class: "bg-red-100 text-red-800 border border-red-300"
    },
    default: {
        label: dictionary.pickUp.status.default,
        class: "bg-blue-500 hover:bg-blue-600"
    }
};