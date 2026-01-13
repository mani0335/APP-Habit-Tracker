import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
const bgUrl = "/images/login-bg.jpg";

type User = { id: string; name: string; email: string; password?: string; createdAt: string };

const Admin = () => {
  const { logout } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [query, setQuery] = useState("");
  const [sortNewest, setSortNewest] = useState(true);

  useEffect(() => {
    const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";
    let mounted = true;
    fetch(`${API_BASE}/users`)
      .then((r) => r.ok ? r.json() : [])
      .then((data) => {
        if (!mounted) return;
        setUsers(data || []);
      })
      .catch(() => {
        if (!mounted) return;
        setUsers([]);
      });
    return () => { mounted = false };
  }, []);

  // Listen for server-sent events so admin sees registrations in real-time
  useEffect(() => {
    const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";
    let es: EventSource | null = null;
    try {
      es = new EventSource(`${API_BASE}/events`);
    } catch (e) {
      es = null;
    }

    if (!es) return;

    const onUser = (ev: MessageEvent) => {
      try {
        const data = JSON.parse(ev.data) as User;
        setUsers((u) => [data, ...u]);
        // show a small transient notification
        setRecentNotif({ id: data.id, text: `${data.name} registered` });
        setTimeout(() => setRecentNotif(null), 4000);
      } catch (e) {
        // ignore
      }
    };

    es.addEventListener('user-registered', onUser as EventListener);
    return () => {
      es && es.close();
    };
  }, []);

  const [recentNotif, setRecentNotif] = useState<{ id: string; text: string } | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = users.filter((u) => !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    list = list.sort((a, b) => (sortNewest ? +new Date(b.createdAt) - +new Date(a.createdAt) : +new Date(a.createdAt) - +new Date(b.createdAt)));
    return list;
  }, [users, query, sortNewest]);

  const handleDelete = (id: string) => {
    const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";
    fetch(`${API_BASE}/users/${id}`, { method: 'DELETE' })
      .then((r) => {
        if (!r.ok) throw new Error('delete failed');
        const filtered = users.filter((u) => u.id !== id);
        setUsers(filtered);
      })
      .catch(() => {
        // optimistic fallback: still remove locally
        const filtered = users.filter((u) => u.id !== id);
        setUsers(filtered);
      });
  };

  const exportCsv = () => {
    const rows = [["id", "name", "email", "createdAt"]].concat(users.map((u) => [u.id, u.name, u.email, u.createdAt]));
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "registered_users.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen p-6 relative overflow-hidden">
      {recentNotif && (
        <div className="fixed top-6 right-6 z-50">
          <div className="px-4 py-2 bg-white/95 backdrop-blur rounded-lg shadow-lg border flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <div className="text-sm font-medium">{recentNotif.text}</div>
          </div>
        </div>
      )}
      <div className="absolute inset-0 -z-20 bg-cover bg-center" style={{ backgroundImage: `url(${bgUrl})` }} />
      <div className="max-w-6xl mx-auto relative">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">View and manage registered accounts</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={exportCsv} className="px-3 py-2 bg-emerald-500 text-white rounded-lg shadow">Export CSV</button>
            <button onClick={() => logout()} className="px-3 py-2 bg-red-500 text-white rounded-lg">Sign out</button>
          </div>
        </div>

        <div className="mb-4 flex gap-3">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name or email" className="flex-1 border rounded-lg px-3 py-2" />
          <button onClick={() => setSortNewest((s) => !s)} className="px-3 py-2 bg-indigo-600 text-white rounded-lg">Sort: {sortNewest ? 'Newest' : 'Oldest'}</button>
        </div>

        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <div className="px-4 py-3 border-b flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Total registered: <strong>{users.length}</strong></div>
            <div className="text-sm text-muted-foreground">Showing: <strong>{filtered.length}</strong></div>
          </div>

          <div className="p-4">
            {filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground">No registered users found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="text-left text-sm text-slate-600">
                      <th className="pb-2">Name</th>
                      <th className="pb-2">Email</th>
                      <th className="pb-2">Registered</th>
                      <th className="pb-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((u) => (
                      <tr key={u.id} className="border-t">
                        <td className="py-3 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">{u.name?.charAt(0) ?? 'U'}</div>
                          <div>
                            <div className="font-semibold">{u.name}</div>
                            <div className="text-xs text-muted-foreground">ID: {u.id}</div>
                          </div>
                        </td>
                        <td className="py-3">{u.email}</td>
                        <td className="py-3">{new Date(u.createdAt).toLocaleString()}</td>
                        <td className="py-3">
                          <button onClick={() => handleDelete(u.id)} className="text-sm text-red-600">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
