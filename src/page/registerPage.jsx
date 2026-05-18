import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import api from "../baseApi";
import { registerService } from "../service/registerService";
import { InputElement } from "../components/inputElement";

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
      const name = e.target.name?.value?.trim();
      const email = e.target.email?.value?.trim();
      const password = e.target.password?.value;
      const confirmPassword = e.target.confirmPassword?.value;

      if (!email || !password || !confirmPassword) {
        setErrorMessage("請輸入電子郵件與密碼");
        return;
      }

      if (password !== confirmPassword) {
        setErrorMessage("兩次輸入的密碼不一致");
        return;
      }

      await registerService.registerAccount({ email, password, display_name: name || undefined });

      // 註冊成功後導回登入
      navigate("/");
    } catch (error) {
      console.error("註冊失敗:", error);
      setErrorMessage("註冊失敗，請稍後再試或確認資料是否正確。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300">
      <div className="bg-white shadow-lg rounded-xl p-8 w-[90%] max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">註冊</h2>

        <form className="space-y-5" onSubmit={handleRegister}>
          <InputElement 
            label="名稱（選填）"
            name="name"
            type="text"
            placeholder="輸入你的名稱"
          /> 

          <InputElement 
            label="電子郵件"
            name="email"
            type="email"
            placeholder="輸入你的電子郵件"
          />

          <InputElement 
            label="密碼"
            name="password"
            type="password"
            placeholder="輸入你的密碼"
          />

          <InputElement 
            label="確認密碼"
            name="confirmPassword"
            type="password"
            placeholder="再次輸入你的密碼"
          />

          {errorMessage && (
            <p className="text-red-500 text-sm text-center">{errorMessage}</p>
          )}

          <button
            type="submit"
            className={`w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            {loading ? "註冊中..." : "註冊"}
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