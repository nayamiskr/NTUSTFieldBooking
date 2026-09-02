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
        class: "bg-gray-500 text-gray-800 border border-gray-300"
    },
    cancel_request: {
        label: dictionary.pickUp.status.cancel_request,
        class: "bg-red-300 text-black-500 border border-red-300"
    },
    default: {
        label: dictionary.pickUp.status.default,
        class: "bg-blue-500 hover:bg-blue-600"
    }
};