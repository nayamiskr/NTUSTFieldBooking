import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect, use } from "react";

import api from "../baseApi";
import Loading from "../components/loading";
import { loginService } from "../service/authService";
import { VENUE_TYPE } from "../constant/VenueType";


function LoginPage() {
  const [filter, setFilter] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [forSchool, setForSchool] = useState(false);
  const [forLine, setForLine] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);

  const navigate = useNavigate();

  const handleVersionFilp = () => {
    setIsFlipping(true);
    setTimeout(() => {
      setForSchool(!forSchool);
      setIsFlipping(false);
    }, 300);
  }

  const handleLogin = async (e) => {
    e.preventDefault();

    if (loading) return;

    if (!filter && !forSchool) {
      setErrorMessage("請先選擇場地類型");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const form = new FormData(e.target);
      const email = form.get("email")?.trim();
      const password = form.get("password");

      if (!email || !password) {
        setErrorMessage("請輸入電子郵件與密碼");
        setLoading(false);
        return;
      }

      await loginService(email, password);

      const baseUrl = forSchool ? "ntust" : "external";
      const typePath = forSchool ? "" : filter;

      navigate(`${baseUrl}/home/${typePath}`);

    } catch (error) {
      console.error("登入失敗:", error);
      setErrorMessage("登入失敗，請檢查您的帳號和密碼。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-100 to-blue-300">
      <Loading isLoading={loading} text="登入中..." />
      <div className="w-[80%] max-w-md" style={{ perspective: "1200px" }}>
        <div className={`relative bg-white shadow-lg rounded-xl p-8 w-full max-w-md transition-transform duration-500 ease-in-out ${isFlipping ? "rotate-y-180" : ""}`}>
          <div className="flex flex-col items-center mb-4">
            <img
              src="/icon/logo.png"
              alt="Logo"
              className="w-14 h-14 mb-2"
            />
            <h1 className="text-2xl font-bold text-gray-800 leading-tight">
              場地租借系統
            </h1>
            <span className="text-sm text-gray-500 mt-1 tracking-wide">
              {forSchool ? "學校版" : forLine ? "Line 登入" : "校外版"}
            </span>
          </div>


          <div>
            <button
              onClick={() => handleVersionFilp()}
              className="absolute top-8 right-8 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition flex flex-col items-center leading-tight"
            >
              <span className="text-sm font-semibold">切換版本</span>

            </button>
          </div>


          <form className="space-y-5" onSubmit={(e) => handleLogin(e)}>
            <div>
              <label className="block text-start text-gray-600 mb-1" htmlFor="email">電子郵件</label>
              <input
                name="email"
                type="email"
                placeholder="輸入你的電子郵件"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-start text-gray-600 mb-1" htmlFor="password">密碼</label>
              <input
                name="password"
                type="password"
                placeholder="輸入你的密碼"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            {!forSchool && !forLine && (
              <div className="w-full flex justify-center flex-wrap gap-4">
                {Object.keys(VENUE_TYPE).map(type => (
                  <button
                    type="button"
                    key={type}
                    onClick={() => setFilter(VENUE_TYPE[type])}
                    className={`px-4 py-2 rounded-md text-white transition ${filter === VENUE_TYPE[type] ? "bg-blue-700" : "bg-blue-400 hover:bg-blue-600"}`}
                  >
                    {type}
                  </button>
                ))}
              </div>)}
            {errorMessage && !forSchool && (
              <p className="text-red-500 text-sm text-center">{errorMessage}</p>
            )}
            <button
              type="submit"
              className={`w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition ${loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              disabled={loading}
            >
              {loading ? "登入中..." : "登入"}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">
            還沒有帳號？{" "}
            <Link to="/register" className="text-blue-500 hover:underline">
              註冊帳號
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}

export default LoginPage;