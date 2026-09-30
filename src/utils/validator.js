import { zhTWDictionary } from "../locale/zh-TW/translate"

export const validateRegister = ({ name, username, gender, birth_date, email, password, confirmPassword }) => {
  const errors = zhTWDictionary.registerPage.errorMessage;
  if (!name || !username || !gender || !birth_date || !email || !password || !confirmPassword) return errors.requiredFields;
  if (!/^[a-zA-Z0-9]+$/.test(username)) return errors.usernameInvalid;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return errors.emailInvalid;
  if (!["male", "female", "other"].includes(gender)) return errors.genderInvalid;
  const [year, month, day] = birth_date.split("-").map(Number);
  const parsedBirthDate = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birth_date)
    || parsedBirthDate.getFullYear() !== year
    || parsedBirthDate.getMonth() !== month - 1
    || parsedBirthDate.getDate() !== day
    || parsedBirthDate > today) return errors.birthDateInvalid;
  if (password !== confirmPassword) return zhTWDictionary.registerPage.errorMessage.passwordMismatch;
  if (password.length < 8) return zhTWDictionary.registerPage.errorMessage.passwordTooShort;
  return null;
};
