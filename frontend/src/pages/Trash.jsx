import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getFolderTrash, restoreFolder } from "../api/folderApi";
import { getFileTrash, restoreFile } from "../api/fileApi";

function Trash() {
    const [folders, setFolders] = useState([]);
    const [files, setFiles] = useState([]);
    const [error, setError] = useState("");

    const loadTrash = () => {
        getFolderTrash().then((res) => setFolders(res.data)).catch((err) => setError(err.response?.data?.message || "Yuklenemedi"));
        getFileTrash().then((res) => setFiles(res.data)).catch((err) => setError(err.response?.data?.message || "Yuklenemedi"));
    };

    useEffect(() => {
        loadTrash();
    }, []);

    const handleRestoreFolder = async (id) => {
        try {
            await restoreFolder(id);
            loadTrash();
        } catch (err) {
            setError(err.response?.data?.message || "Geri yuklenemedi");
        }
    };

    const handleRestoreFile = async (id) => {
        try {
            await restoreFile(id);
            loadTrash();
        } catch (err) {
            setError(err.response?.data?.message || "Geri yuklenemedi");
        }
    };

    return (
        <div style={{ padding: 20 }}>
            <Link to="/dashboard">← Geri</Link>
            <h2>Cop Kutusu</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}

            <h3>Klasorler</h3>
            <ul>
                {folders.map((f) => (
                    <li key={f.id}>
                        📁 {f.name} <button onClick={() => handleRestoreFolder(f.id)}>Geri Yukle</button>
                    </li>
                ))}
            </ul>

            <h3>Dosyalar</h3>
            <ul>
                {files.map((f) => (
                    <li key={f.id}>
                        📄 {f.name} <button onClick={() => handleRestoreFile(f.id)}>Geri Yukle</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Trash;