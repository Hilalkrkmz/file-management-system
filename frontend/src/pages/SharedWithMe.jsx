import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getSharedWithMe } from "../api/shareApi";

function SharedWithMe() {
    const [shares, setShares] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        getSharedWithMe()
            .then((res) => setShares(res.data))
            .catch((err) => setError(err.response?.data?.message || "Yuklenemedi"));
    }, []);

    return (
        <div style={{ padding: 20 }}>
            <Link to="/dashboard">← Geri</Link>
            <h2>Benimle Paylasilanlar</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <ul>
                {shares.map((s) => (
                    <li key={s.id}>
                        📄 {s.fileName} — paylasan: {s.sharedByUsername} ({s.permission})
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default SharedWithMe;