export const zhTWDictionary = {
  registerPage: {
    title: "註冊",
    input: {
      label: {
        name: "姓名",
        email: "電子郵件",
        password: "密碼 (需超過8個字元)",
        confirmPassword: "確認密碼",
      },
      placeholder: {
        name: "輸入你的名稱",
        email: "輸入你的電子郵件",
        password: "輸入你的密碼",
        confirmPassword: "再次輸入你的密碼",
      }
    },
    errorMessage: {
      requiredFields: "請填寫所有必填欄位",
      emailExist: "該電子郵件已註冊",
      passwordMismatch: "密碼與確認密碼不一致",
      passwordTooShort: "密碼長度需超過8個字元",
      registrationFailed: "註冊失敗，請稍後再試"
    },
    button: {
      registering: "註冊中...",
      register: "註冊"
    },
  },
  pickUp: {
    status: {
      pending: "審核中",
      confirmed: "已報名",
      cancelled: "已取消",
      rejected: "已拒絕",
      default: "立即報名",
    },
  },
  common: {
    null: "無",
    range: "範圍",
    more: "更多",
    loading: "載入中...",
  },
  facilities: {
    waterdis: "飲水機",
    airconditioner: "冷氣",
    accessible: "無障礙設施",
    wifi: "網路",
    restRoom: "廁所",
    showerRoom: "淋浴間",
    lighting: "照明設備",
    lockerRoom: "更衣室",
    equipmentRental: "器材租借",
    firstAid: "急救設施",
  },
};
