import { validateRegister } from "./validator";
import { zhTWDictionary } from "../locale/zh-TW/translate";

const validForm = {
  name: "小明",
  username: "ming123",
  gender: "other",
  birth_date: "2000-02-29",
  email: "ming@example.com",
  password: "password123",
  confirmPassword: "password123",
};

test("accepts a valid registration including a leap-day birthday", () => {
  expect(validateRegister(validForm)).toBeNull();
});

test("rejects an invalid or future birthday", () => {
  const error = zhTWDictionary.registerPage.errorMessage.birthDateInvalid;
  expect(validateRegister({ ...validForm, birth_date: "2001-02-29" })).toBe(error);
  expect(validateRegister({ ...validForm, birth_date: "2999-01-01" })).toBe(error);
});

test("requires the new profile fields", () => {
  const error = zhTWDictionary.registerPage.errorMessage.requiredFields;
  expect(validateRegister({ ...validForm, gender: "" })).toBe(error);
  expect(validateRegister({ ...validForm, birth_date: "" })).toBe(error);
});
