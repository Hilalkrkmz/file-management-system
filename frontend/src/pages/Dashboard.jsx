import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate, Link } from "react-router-dom";
import { getFolders, createFolder, deleteFolder } from "../api/folderApi";
import { getFiles, uploadFile, downloadFile, deleteFile, searchFiles } from "../api/fileApi";
import { shareWithUser, createShareLink } from "../api/shareApi";

function Dashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [currentFolderId, setCurrentFolderId] = useState(null);
    const [breadcrumb, setBreadcrumb] = useState([{ id: null, name: "Ana Dizin" }]);
    const [folders, setFolders] = useState([]);
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showNewFolderInput, setShowNewFolderInput] = useState(false);
    const [newFolderName, setNewFolderName] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState(null);

    const loadContents = async (folderId) => {
        setLoading(true);
        setError("");
        try {
            const foldersRes = await getFolders(folderId);
            setFolders(foldersRes.data);

            if (folderId) {
                const filesRes = await getFiles(folderId);
                setFiles(filesRes.data);
            } else {
                setFiles([]);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Icerik yuklenemedi");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadContents(currentFolderId);
    }, [currentFolderId]);

    const handleFolderClick = (folder) => {
        setCurrentFolderId(folder.id);
        setBreadcrumb([...breadcrumb, { id: folder.id, name: folder.name }]);
    };

    const handleBreadcrumbClick = (index) => {
        const clicked = breadcrumb[index];
        setCurrentFolderId(clicked.id);
        setBreadcrumb(breadcrumb.slice(0, index + 1));
    };

    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) return;

        try {
            await createFolder(newFolderName, currentFolderId);
            setNewFolderName("");
            setShowNewFolderInput(false);
            loadContents(currentFolderId);
        } catch (err) {
            setError(err.response?.data?.message || "Klasor olusturulamadi");
        }
    };

    const handleDeleteFolder = async (id) => {
        if (!window.confirm("Bu klasoru silmek istediginize emin misiniz?")) return;
        try {
            await deleteFolder(id);
            loadContents(currentFolderId);
        } catch (err) {
            setError(err.response?.data?.message || "Klasor silinemedi");
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !currentFolderId) return;

        try {
            await uploadFile(currentFolderId, file);
            loadContents(currentFolderId);
        } catch (err) {
            setError(err.response?.data?.message || "Dosya yuklenemedi");
        }
        e.target.value = "";
    };

    const handleFileDelete = async (id) => {
        if (!window.confirm("Bu dosyayi silmek istediginize emin misiniz?")) return;
        try {
            await deleteFile(id);
            loadContents(currentFolderId);
        } catch (err) {
            setError(err.response?.data?.message || "Dosya silinemedi");
        }
    };

    const handleShareWithUser = async (fileId) => {
        const targetUsername = window.prompt("Kiminle paylasmak istiyorsun (kullanici adi)?");
        if (!targetUsername) return;

        try {
            await shareWithUser(fileId, targetUsername, "VIEW");
            alert("Paylasildi");
        } catch (err) {
            setError(err.response?.data?.message || "Paylasilamadi");
        }
    };

    const handleCreateLink = async (fileId) => {
        try {
            const res = await createShareLink(fileId, "DOWNLOAD", 24);
            const link = `${window.location.origin}/share/${res.data.token}`;
            navigator.clipboard.writeText(link);
            alert("Link kopyalandi: " + link);
        } catch (err) {
            setError(err.response?.data?.message || "Link olusturulamadi");
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) {
            setSearchResults(null);
            return;
        }
        try {
            const res = await searchFiles(searchQuery);
            setSearchResults(res.data);
        } catch (err) {
            setError(err.response?.data?.message || "Arama basarisiz");
        }
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div style={{ padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
                <h2>Hosgeldin, {user?.username}</h2>
                <div>
                    <Link to="/shared-with-me" style={{ marginRight: 10 }}>Benimle Paylasilanlar</Link>
                    <Link to="/trash" style={{ marginRight: 10 }}>Cop Kutusu</Link>
                    {user?.role === "ADMIN" && (
                        <Link to="/admin" style={{ marginRight: 10 }}>Admin Paneli</Link>
                    )}
                    <button onClick={handleLogout}>Cikis Yap</button>
                </div>
            </div>

            <form onSubmit={handleSearch} style={{ margin: "10px 0" }}>
                <input
                    type="text"
                    placeholder="Dosya ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit">Ara</button>
                {searchResults && (
                    <button
                        type="button"
                        onClick={() => {
                            setSearchResults(null);
                            setSearchQuery("");
                        }}
                    >
                        Temizle
                    </button>
                )}
            </form>

            <div style={{ margin: "10px 0" }}>
                {breadcrumb.map((crumb, index) => (
                    <span key={crumb.id ?? "root"}>
                        <button onClick={() => handleBreadcrumbClick(index)}>{crumb.name}</button>
                        {index < breadcrumb.length - 1 && " / "}
                    </span>
                ))}
            </div>

            <div style={{ marginBottom: 10 }}>
                {!showNewFolderInput ? (
                    <button onClick={() => setShowNewFolderInput(true)}>+ Yeni Klasor</button>
                ) : (
                    <span>
                        <input
                            type="text"
                            placeholder="Klasor adi"
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            autoFocus
                        />
                        <button onClick={handleCreateFolder}>Olustur</button>
                        <button
                            onClick={() => {
                                setShowNewFolderInput(false);
                                setNewFolderName("");
                            }}
                        >
                            Iptal
                        </button>
                    </span>
                )}
                {currentFolderId && (
                    <label style={{ marginLeft: 10 }}>
                        <input type="file" onChange={handleFileUpload} style={{ display: "none" }} id="fileInput" />
                        <button onClick={() => document.getElementById("fileInput").click()}>+ Dosya Yukle</button>
                    </label>
                )}
            </div>

            {error && <p style={{ color: "red" }}>{error}</p>}
            {loading && <p>Yukleniyor...</p>}

            {searchResults ? (
                <div>
                    <h3>Arama Sonuclari</h3>
                    <ul>
                        {searchResults.map((file) => (
                            <li key={file.id}>
                                📄 {file.name} ({(file.size / 1024).toFixed(1)} KB){" "}
                                <button onClick={() => downloadFile(file.id, file.name)}>Indir</button>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <ul>
                    {folders.map((folder) => (
                        <li key={folder.id}>
                            📁{" "}
                            <span style={{ cursor: "pointer" }} onClick={() => handleFolderClick(folder)}>
                                {folder.name}
                            </span>{" "}
                            <button onClick={() => handleDeleteFolder(folder.id)}>Sil</button>
                        </li>
                    ))}

                    {files.map((file) => (
                        <li key={file.id}>
                            📄 {file.name} ({(file.size / 1024).toFixed(1)} KB){" "}
                            <button onClick={() => downloadFile(file.id, file.name)}>Indir</button>{" "}
                            <button onClick={() => handleFileDelete(file.id)}>Sil</button>{" "}
                            <button onClick={() => handleShareWithUser(file.id)}>Paylas</button>{" "}
                            <button onClick={() => handleCreateLink(file.id)}>Link Olustur</button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default Dashboard;