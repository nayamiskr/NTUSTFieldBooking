import api from "../baseApi";
import { zhTWDictionary } from "../locale/zh-TW/translate"
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { registerService } from "../service/registerService";
import { InputElement } from "../components/inputElement";
import { errorPopup } from "../components/pop-up";
import { validateRegister } from "../utils/validator";

function RegisterPage() {
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setErrorMessage("");

    try {
      const formData = {
        name: e.target.name?.value?.trim(),
        username: e.target.username?.value?.trim(),
        email: e.target.email?.value?.trim(),
        password: e.target.password?.value,
        confirmPassword: e.target.confirmPassword?.value,
      };

      const validationError = validateRegister(formData);


      if (validationError) {
        console.log("Validation Error:", validationError); // Log the validation error for debugging
        errorPopup(zhTWDictionary.registerPage.errorMessage.error, validationError);
        setLoading(false);
        return;
      }

      await registerService.registerAccount({
        email: formData.email,
        username: formData.username,
        password: formData.password,
        display_name: formData.name
      });

      // 註冊成功後導回登入
      navigate("/");
    } catch (error) {
      if (error.status === 409) {
        errorPopup(zhTWDictionary.registerPage.errorMessage.error, zhTWDictionary.registerPage.errorMessage.emailExist);
      } else {
        errorPopup(zhTWDictionary.registerPage.errorMessage.error, zhTWDictionary.registerPage.errorMessage.registrationFailed);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300">
      <div className="bg-white shadow-lg rounded-xl p-8 w-[90%] max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">{zhTWDictionary.registerPage.title}</h2>

        <form className="space-y-5" onSubmit={handleRegister}>
          <InputElement
            label={zhTWDictionary.registerPage.input.label.name}
            name="name"
            type="text"
            placeholder={zhTWDictionary.registerPage.input.placeholder.name}
          />

          <InputElement
            label={zhTWDictionary.registerPage.input.label.username}
            name="username"
            type="text"
            placeholder={zhTWDictionary.registerPage.input.placeholder.username}
          />

          <InputElement
            label={zhTWDictionary.registerPage.input.label.email}
            name="email"
            type="email"
            placeholder={zhTWDictionary.registerPage.input.placeholder.email}
          />

          <InputElement
            label={zhTWDictionary.registerPage.input.label.password}
            name="password"
            type="password"
            placeholder={zhTWDictionary.registerPage.input.placeholder.password}
          />

          <InputElement
            label={zhTWDictionary.registerPage.input.label.confirmPassword}
            name="confirmPassword"
            type="password"
            placeholder={zhTWDictionary.registerPage.input.placeholder.confirmPassword}
          />

          {errorMessage && (
            <p className="text-red-500 text-sm text-center">{errorMessage}</p>
          )}

          <button
            type="submit"
            className={`w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition ${loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            disabled={loading}
          >
            {loading ? zhTWDictionary.registerPage.button.registering : zhTWDictionary.registerPage.button.register}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          已有帳號？{" "}
          <Link to="/" className="text-blue-500 hover:underline">
            回到登入
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;