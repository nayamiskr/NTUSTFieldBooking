import { useEffect, useRef, useState } from "react";
import { Bell, CheckCheck, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import Navbar from "../components/navbar";
import Loading from "../../components/loading";
import NotificationCard from "../components/notifications/NotificationCard";
import { notificationService } from "../../service/notificationService";

const PAGE_SIZE = 10;

export function AnnouncePage() {
    const [query, setQuery] = useState({ unreadOnly: false, page: 1 });
    const [result, setResult] = useState({ items: [], total: 0, pageSize: PAGE_SIZE });
    const [unreadCount, setUnreadCount] = useState(null);
    const [countError, setCountError] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionError, setActionError] = useState("");
    const [feedback, setFeedback] = useState("");
    const [pending, setPending] = useState(null);
    const mutationRef = useRef(false);
    const mountedRef = useRef(false);
    const [refresh, setRefresh] = useState(0);

    useEffect(() => {
        mountedRef.current = true;
        return () => { mountedRef.current = false; };
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        let cancelled = false;
        setLoading(true);
        setError("");
        async function load() {
            const [list, count] = await Promise.allSettled([
                notificationService.getList({ ...query, pageSize: PAGE_SIZE, signal: controller.signal }),
                notificationService.getUnreadCount({ signal: controller.signal }),
            ]);
            if (cancelled) return;
            if (count.status === "fulfilled") {
                setUnreadCount(count.value);
                setCountError(false);
            } else {
                setUnreadCount(null);
                setCountError(true);
            }
            if (list.status === "fulfilled") {
                const lastPage = Math.max(1, Math.ceil(list.value.total / list.value.pageSize));
                if (query.page > lastPage) {
                    setQuery((current) => ({ ...current, page: lastPage }));
                    return;
                }
                setResult(list.value);
            } else {
                setError("目前無法載入通知，請稍後再試。");
            }
            setLoading(false);
        }
        load();
        return () => { cancelled = true; controller.abort(); };
    }, [query, refresh]);

    async function markRead(id = null) {
        if (mutationRef.current) return;
        mutationRef.current = true;
        setPending(id || "all");
        setActionError("");
        setFeedback("");
        try {
            if (id) await notificationService.markRead(id);
            else await notificationService.markAllRead();
            if (!mountedRef.current) return;
            setFeedback(id ? "通知已標記為已讀。" : "全部通知已標記為已讀。");
            setRefresh((value) => value + 1);
        } catch {
            if (mountedRef.current) setActionError("標記已讀失敗，請再試一次。");
        } finally {
            mutationRef.current = false;
            if (mountedRef.current) setPending(null);
        }
    }

    const pageCount = Math.max(1, Math.ceil(result.total / result.pageSize));
    const busy = Boolean(pending);
    const changeFilter = (unreadOnly) => {
        setFeedback("");
        setActionError("");
        setQuery({ unreadOnly, page: 1 });
    };

    return <div className="min-h-screen bg-slate-50/50">
        <Navbar />
        <Loading isLoading={loading} text="正在載入通知…" />
        <h1 class="text-3xl font-bold text-center mt-8 md-4">我的預約</h1>


        <main className="mx-auto w-[92%] max-w-4xl py-8 sm:py-10">
            <header className="mb-6 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <span className="grid size-11 place-items-center rounded-xl border border-blue-100 bg-white text-blue-600"><Bell size={23} aria-hidden="true" /></span>
                        {unreadCount !== null && <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">{unreadCount} 則未讀</span>}
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => markRead()} disabled={loading || busy || unreadCount === 0} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-blue-600 px-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"><CheckCheck size={16} />{pending === "all" ? "處理中…" : "全部標為已讀"}</button>
                </div>
            </header>

            <div className="mb-5 flex items-center justify-between gap-3 border-b border-slate-200">
                <div className="flex gap-5" role="group" aria-label="通知篩選">
                    {[{ label: "全部通知", unreadOnly: false }, { label: "未讀通知", unreadOnly: true }].map((tab) => <button key={tab.label} type="button" aria-pressed={query.unreadOnly === tab.unreadOnly} disabled={busy} onClick={() => changeFilter(tab.unreadOnly)} className={`min-h-12 border-b-2 px-1 text-sm font-semibold disabled:opacity-50 ${query.unreadOnly === tab.unreadOnly ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}>{tab.label}</button>)}
                </div>
                {!loading && !error && <span className="text-xs text-slate-400">共 {result.total} 則</span>}
            </div>
            <p role="status" className="mb-3 text-sm text-slate-500">{feedback}</p>
            {countError && <p className="mb-3 text-xs text-amber-700">未讀數暫時無法載入，可按重新整理重試。</p>}
            {actionError && <p role="alert" className="mb-4 rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-700">{actionError}</p>}


            {!loading && !error && result.total > 0 && <nav aria-label="通知分頁" className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm">
                <p className="text-slate-500">第 {query.page} / {pageCount} 頁</p>
                <div className="flex gap-2">
                    <button type="button" aria-label="上一頁" disabled={busy || query.page <= 1} onClick={() => setQuery((current) => ({ ...current, page: current.page - 1 }))} className="inline-flex min-h-10 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-slate-600 hover:bg-slate-50 disabled:opacity-40"><ChevronLeft size={16} />上一頁</button>
                    <button type="button" aria-label="下一頁" disabled={busy || query.page >= pageCount} onClick={() => setQuery((current) => ({ ...current, page: current.page + 1 }))} className="inline-flex min-h-10 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-slate-600 hover:bg-slate-50 disabled:opacity-40">下一頁<ChevronRight size={16} /></button>
                </div>
            </nav>}
        </main>
    </div>;
}
