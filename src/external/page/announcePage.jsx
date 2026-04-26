import Navbar from "../components/navbar";

export function AnnouncePage() {
    return (
        <div>
            <Navbar />
            <h1 class="text-3xl font-bold text-center my-8">公告欄</h1>
            <div className="flex w-[80%] justify-self-center justify-between border border-blue-300 rounded-md p-4 mb-4 mx-auto">
                <div className="flex flex-col text-left">
                    <p className="text-xl font-semibold text-gray-900 mb-2">公告標題</p>
                    <p className="text-md text-gray-500">公告內容公告內容公告內容公告內容公告內容公告內容公告內容公告內容公告內容公告內容</p>
                    <p className="text-sm text-gray-500 mt-auto">發布日期: 2026-10-10</p>
                </div>
            </div>
        </div>
    )
}