import { zhTWDictionary } from "../locale/zh-TW/translate"

export const validateRegister = ({ username, email, password, confirmPassword }) => {
  if (username && !/^[a-zA-Z0-9]+$/.test(username)) return zhTWDictionary.registerPage.errorMessage.usernameInvalid;
  if (!email || !password || !confirmPassword) return zhTWDictionary.registerPage.errorMessage.requiredFields;
  if (password !== confirmPassword) return zhTWDictionary.registerPage.errorMessage.passwordMismatch;
  if (password.length < 8) return zhTWDictionary.registerPage.errorMessage.passwordTooShort;
  return null;
};