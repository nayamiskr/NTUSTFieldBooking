import Navbar from "../components/navbar";
import { useEffect, useState } from "react";
import { getUserProfile } from "../../service/userService";

export function UserPage() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUserProfile = async () => {
            const user = await getUserProfile();
            setUser(user);
            console.log("Fetched user profile:", user); // Debugging line
        };

        fetchUserProfile();
    }, []);

    if (!user) return <p className="text-center mt-10 text-gray-500">載入中...</p>;

    return (
        <div>
            <Navbar />
            <h1 className="text-3xl font-bold text-center m-8">個人檔案</h1>

            <div className="max-w-4xl mx-auto space-y-6">
                <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm mb-6 flex items-center gap-6">
                    <img
                        src={user.avatar || "https://via.placeholder.com/80"}
                        alt="大頭貼"
                        className="w-20 h-20 rounded-full object-cover border border-gray-200"
                    />
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{user.display_name}</h2>
                        <p className="text-gray-500 text-sm">@{user.username}</p>

                        {/* 權限標籤 (用你前面剛搞定的標籤寫法) */}
                        <div className="flex flex-wrap gap-2 mt-3">
                            {user.is_system_admin && (
                                <span className="bg-red-50 text-red-600 px-2 py-1 rounded-md text-xs font-bold border border-red-200">系統管理員</span>
                            )}
                            {user.is_pickup_host && (
                                <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-md text-xs font-bold border border-blue-200">臨打團主</span>
                            )}
                            {!user.is_active && (
                                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs font-bold border border-gray-200">帳號未啟用</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* 區塊 2：聯絡與帳號資訊 */}
                <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm mb-6">
                    <h3 className="text-lg font-bold mb-4 text-gray-800">基本資訊</h3>
                    <div className="space-y-3 text-gray-700">
                        <p><span className="font-medium mr-2">信箱:</span> {user.email}</p>
                        <p><span className="font-medium mr-2">電話:</span> {user.phone || "未提供"}</p>
                        <p className="text-sm text-gray-400 mt-4 pt-4 border-t border-gray-100">
                            加入時間: {new Date(user.created_at).toLocaleDateString('zh-TW')}
                        </p>
                    </div>
                </div>

                {/* 區塊 3：所屬組織 (如果有才顯示) */}
                {user.organizations?.length > 0 && (
                    <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm">
                        <h3 className="text-lg font-bold mb-4 text-gray-800">所屬組織</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {user.organizations.map((org) => (
                                <div key={org.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                                    <h4 className="font-bold text-gray-900 mb-2">{org.name || "未命名組織"}</h4>
                                    <div className="flex gap-2">
                                        {org.owner && <span className="bg-yellow-50 text-yellow-700 px-2 py-1 rounded text-xs font-bold border border-yellow-200">負責人</span>}
                                        {org.organization_manager && <span className="bg-green-50 text-green-700 px-2 py-1 rounded text-xs font-bold border border-green-200">管理員</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}