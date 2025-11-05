import { useNavigate } from "react-router-dom";
import { useState } from "react";

function LoginPage() {
  const [filter, setFilter] = useState();
  const navigate = useNavigate();
  const handleLogin = (e) => {
    e.preventDefault();
    navigate("/home", { state: { selectedType: filter } });
  };

  return (
    <div class="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-100 to-blue-300">
      <div class="bg-white shadow-lg rounded-xl p-8 w-[90%] max-w-md">
        <h2 class="text-2xl font-bold text-center mb-6 text-gray-800">登入</h2>
        <form class="space-y-5" onSubmit={handleLogin}>
          <div>
            <label class="block text-gray-600 mb-1" htmlFor="email">電子郵件</label>
            <input
              id="email"
              type="email"
              placeholder="輸入你的電子郵件"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label class="block text-gray-600 mb-1" htmlFor="password">密碼</label>
            <input
              id="password"
              type="password"
              placeholder="輸入你的密碼"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div class="w-full flex justify-center flex-wrap gap-4 my-4">
            {["全部", "羽球場", "網球場", "籃球場", "排球場"].map(type => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                class={`px-4 py-2 mt-3 rounded-md text-white transition ${filter === type ? "bg-blue-700" : "bg-blue-400 hover:bg-blue-600"
                  }`}
              >
                {type}
              </button>
            ))}
          </div>
        </form>
        <p class="text-center text-sm text-gray-500 mt-4">
          還沒有帳號？{" "}
          <a href="/register" class="text-blue-500 hover:underline">
            註冊帳號
          </a>
        </p>

      </div>
    </div>
  );
}

export default LoginPage;