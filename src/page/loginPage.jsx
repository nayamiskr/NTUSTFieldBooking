import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import api from "../baseApi";


function LoginPage() {
  const [filter, setFilter] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleLogin = async (e, type) => {
    e.preventDefault();

    if (loading) return;

    if (!type) {
      setErrorMessage("請先選擇場地類型");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const email = e.target.email?.value?.trim();
      const password = e.target.password?.value;

      if (!email || !password) {
        setErrorMessage("請輸入電子郵件與密碼");
        setLoading(false);
        return;
      }

      const res = await api.post("/auth/login", { email, password });

      navigate(`/home/${type}/${res.data.access_token}`, {
        state: { selectedType: type },
      });
    } catch (error) {
      console.error("登入失敗:", error);
      setErrorMessage("登入失敗，請檢查您的帳號和密碼。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300">
      <div className="bg-white shadow-lg rounded-xl p-8 w-[90%] max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">登入</h2>
        <form className="space-y-5" onSubmit={(e) => handleLogin(e, filter)}>
          <div>
            <label className="block text-gray-600 mb-1" htmlFor="email">電子郵件</label>
            <input
              name="email"
              type="email"
              placeholder="輸入你的電子郵件"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block text-gray-600 mb-1" htmlFor="password">密碼</label>
            <input
              name="password"
              type="password"
              placeholder="輸入你的密碼"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="w-full flex justify-center flex-wrap gap-4 my-4">
            {["全部", "羽球場", "網球場", "籃球場", "排球場"].map(type => (
              <button
                type="button"
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 py-2 mt-3 rounded-md text-white transition ${filter === type ? "bg-blue-700" : "bg-blue-400 hover:bg-blue-600"
                  }`}
              >
                {type}
              </button>
            ))}
          </div>
          {errorMessage && (
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
  );
}

export default LoginPage;