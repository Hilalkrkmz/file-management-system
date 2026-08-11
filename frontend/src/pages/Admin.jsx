import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAllUsers, getAllFiles, adminDeleteFile, updateUserQuota } from "../api/adminApi";

function Admin() {
    const [users, setUsers] = useState([]);
    const [files, setFiles] = useState([]);
    const [error, setError] = useState("");

    const loadData = () => {
        getAllUsers().then((res) => setUsers(res.data)).catch((err) => setError(err.response?.data?.message || "Yuklenemedi"));
        getAllFiles().then((res) => setFiles(res.data)).catch((err) => setError(err.response?.data?.message || "Yuklenemedi"));
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleQuotaChange = async (userId) => {
        const newQuota = window.prompt("Yeni kota (MB):");
        if (!newQuota) return;
        try {
            await updateUserQuota(userId, Number(newQuota));
            loadData();
        } catch (err) {
            setError(err.response?.data?.message || "Kota guncellenemedi");
        }
    };

    const handleDeleteFile = async (id) => {
        if (!window.confirm("Silinsin mi?")) return;
        try {
            await adminDeleteFile(id);
            loadData();
        } catch (err) {
            setError(err.response?.data?.message || "Silinemedi");
        }
    };

    return (
        <div style={{ padding: 20 }}>
            <Link to="/dashboard">← Geri</Link>
            <h2>Admin Paneli</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}

            <h3>Kullanicilar</h3>
            <ul>
                {users.map((u) => (
                    <li key={u.id}>
                        {u.username} ({u.email}) — {u.role} — Kota: {u.storageQuotaMb}MB{" "}
                        <button onClick={() => handleQuotaChange(u.id)}>Kota Degistir</button>
                    </li>
                ))}
            </ul>

            <h3>Tum Dosyalar</h3>
            <ul>
                {files.map((f) => (
                    <li key={f.id}>
                        {f.name} — sahibi: {f.ownerUsername} ({(f.size / 1024).toFixed(1)} KB){" "}
                        <button onClick={() => handleDeleteFile(f.id)}>Sil</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Admin;