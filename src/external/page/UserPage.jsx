import { useEffect, useState } from "react";

import Navbar from "../components/navbar";
import { CalendarDays, Mail, Phone, UserRound, UsersRound } from "lucide-react";
import { getUserProfile, updateUserProfile } from "../../service/userService";
import { InfoIconMap } from "../../constant/IconMap";
import Loading from "../../components/loading";
import { errorPopup, successPopup } from "../../components/pop-up";

const createEditableProfile = (user) => ({
    display_name: user.display_name || "",
    phone: user.phone || "",
    gender: user.gender || "",
    birth_date: user.birth_date?.slice(0, 10) || "",
});

const calculateAge = (birthDate) => {
    if (!birthDate) return undefined;

    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const hasNotHadBirthday = today.getMonth() < birth.getMonth()
        || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate());
    return hasNotHadBirthday ? age - 1 : age;
};

export function UserPage() {
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        display_name: "",
        phone: "",
        gender: "",
        birth_date: "",
    });

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const profile = await getUserProfile();
                setUser(profile);
                setFormData(createEditableProfile(profile));
            } catch (error) {
                console.error("取得個人資料失敗：", error);
                errorPopup("個人資料", "目前無法取得個人資料，請稍後再試。");
            }
        };

        fetchUserProfile();
    }, []);

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData((current) => ({ ...current, [name]: value }));
    };

    const handleCancelEdit = () => {
        setFormData(createEditableProfile(user));
        setIsEditing(false);
    };

    const handleSaveProfile = async (event) => {
        event.preventDefault();

        if (!formData.display_name.trim() || !formData.gender || !formData.birth_date) {
            errorPopup("資料不完整", "請填寫顯示名稱、性別與出生日期。");
            return;
        }

        try {
            setIsSaving(true);
            const editableData = {
                display_name: formData.display_name.trim(),
                phone: formData.phone.trim(),
                gender: formData.gender,
                birth_date: formData.birth_date,
            };
            const result = await updateUserProfile(editableData);
            const updatedUser = result?.user || {};

            setUser((current) => ({
                ...current,
                ...editableData,
                age: calculateAge(editableData.birth_date),
                ...updatedUser,
            }));
            setIsEditing(false);
            successPopup("儲存成功", "個人資料已更新。");
        } catch (error) {
            console.error("更新個人資料失敗：", error);
            errorPopup("儲存失敗", "無法更新個人資料，請稍後再試。");
        } finally {
            setIsSaving(false);
        }
    };

    if (!user) return <Loading />;

    const avatar = user.avatar;
    const displayName = user.display_name || user.username || "使用者";
    const birthDate = user.birth_date
        ? new Intl.DateTimeFormat("zh-TW", { year: "numeric", month: "long", day: "numeric" }).format(new Date(user.birth_date))
        : "未提供";
    const genderMap = { male: "男性", female: "女性", other: "其他" };

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            <Navbar />
            <main className="mx-auto w-[92%] max-w-4xl pt-8 sm:pt-10">
                <div className="mb-5">
                    <h1 className="text-3xl font-bold text-gray-900">個人檔案</h1>
                </div>

                <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                        <div className="relative grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-full bg-blue-100 text-2xl font-bold text-blue-700">
                            {displayName.charAt(0)}
                            {avatar && (
                                <img
                                    src={avatar}
                                    alt={`${displayName} 的頭像`}
                                    onError={(event) => { event.currentTarget.style.display = "none"; }}
                                    className="absolute inset-0 h-full w-full object-cover"
                                />
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <h2 className="truncate text-2xl font-bold text-slate-900">{displayName}</h2>
                            <p className="mt-1 text-sm text-slate-500">@{user.username || "未設定 username"}</p>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {user.is_pickup_host && (
                                    <span className="rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-600">臨打團主</span>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                <div className="mt-5">
                    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="mb-5 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <span className="grid h-9 w-9 place-items-center rounded-lg bg-blue-50 text-blue-600"><UserRound size={20} /></span>
                                <div>
                                    <h3 className="font-bold text-slate-900">基本資訊</h3>
                                    <p className="text-sm text-slate-500">個人與聯絡資料</p>
                                </div>
                            </div>
                            {!isEditing && (
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(true)}
                                    className="rounded-lg border border-blue-200 px-3 py-2 text-sm font-bold text-blue-600 transition hover:bg-blue-50"
                                >
                                    編輯資料
                                </button>
                            )}
                        </div>
                        {isEditing ? (
                            <form onSubmit={handleSaveProfile} className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <label className="block text-sm font-semibold text-slate-700">
                                        顯示名稱
                                        <input name="display_name" value={formData.display_name} onChange={handleInputChange} className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2 font-normal outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                                    </label>
                                    <label className="block text-sm font-semibold text-slate-700">
                                        電話
                                        <input name="phone" type="tel" value={formData.phone} onChange={handleInputChange} className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2 font-normal outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                                    </label>
                                    <label className="block text-sm font-semibold text-slate-700">
                                        性別
                                        <select name="gender" value={formData.gender} onChange={handleInputChange} className="mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 font-normal outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                                            <option value="" disabled>請選擇</option>
                                            <option value="male">男性</option>
                                            <option value="female">女性</option>
                                            <option value="other">其他</option>
                                        </select>
                                    </label>
                                </div>
                                <p className="text-sm text-slate-500">Email、username、頭像與組織資料無法透過目前 API 修改。</p>
                                <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
                                    <button type="button" onClick={handleCancelEdit} disabled={isSaving} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-bold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60">取消</button>
                                    <button type="submit" disabled={isSaving} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">{isSaving ? "儲存中..." : "儲存變更"}</button>
                                </div>
                            </form>
                        ) : (
                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="flex items-center gap-3 rounded-lg bg-gray-50 px-4 py-3">
                                    <span className="text-blue-600"><Mail size={19} /></span>
                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold text-slate-500">電子信箱</p>
                                        <p className="mt-0.5 truncate font-medium text-slate-800">{user.email || "未提供"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 rounded-lg bg-gray-50 px-4 py-3">
                                    <span className="text-blue-600"><Phone size={19} /></span>
                                    <div>
                                        <p className="text-xs font-semibold text-slate-500">聯絡電話</p>
                                        <p className="mt-0.5 font-medium text-slate-800">{user.phone || "未提供"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 rounded-lg bg-gray-50 px-4 py-3">
                                    <div className="text-blue-600">{InfoIconMap.gender.icon}</div>
                                    <div>
                                        <p className="text-xs font-semibold text-slate-500">性別</p>
                                        <p className="mt-0.5 font-medium text-slate-800">{genderMap[user.gender] || "未提供"}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>
                </div>

                {user.organizations?.length > 0 && (
                    <section className="mt-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="mb-5 flex items-center gap-3">
                            <span className="grid h-9 w-9 place-items-center rounded-lg bg-blue-50 text-blue-600"><UsersRound size={20} /></span>
                            <div>
                                <h3 className="font-bold text-slate-900">所屬組織</h3>
                                <p className="text-sm text-slate-500">你目前參與的運動社群</p>
                            </div>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                            {user.organizations.map((org) => (
                                <div key={org.id} className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                                    <h4 className="font-bold text-slate-900">{org.name || "未命名組織"}</h4>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {org.owner && <span className="rounded-md border border-yellow-200 bg-yellow-50 px-2 py-1 text-xs font-bold text-yellow-700">負責人</span>}
                                        {org.organization_manager && <span className="rounded-md border border-green-200 bg-green-50 px-2 py-1 text-xs font-bold text-green-700">管理員</span>}
                                        {org.location_manager?.length > 0 && <span className="rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700">管理 {org.location_manager.length} 個場地</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}
