import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate, Link } from "react-router-dom";
import { getFolders, createFolder, deleteFolder } from "../api/folderApi";
import { getFiles, uploadFile, downloadFile, deleteFile, searchFiles } from "../api/fileApi";
import { shareWithUser, createShareLink } from "../api/shareApi";

import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import MuiLink from "@mui/material/Link";
import Alert from "@mui/material/Alert";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import FolderIcon from "@mui/icons-material/Folder";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import ShareIcon from "@mui/icons-material/Share";
import LinkIcon from "@mui/icons-material/Link";
import Layout from "../components/Layout.jsx";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import "../styles/Dashboard.css";

function Dashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [currentFolderId, setCurrentFolderId] = useState(null);
    const [breadcrumb, setBreadcrumb] = useState([{ id: null, name: "Ana Dizin" }]);
    const [folders, setFolders] = useState([]);
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [newFolderDialogOpen, setNewFolderDialogOpen] = useState(false);
    const [newFolderName, setNewFolderName] = useState("");
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [shareTarget, setShareTarget] = useState(null);
    const [shareUsername, setShareUsername] = useState("");
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
            setNewFolderDialogOpen(false);
            loadContents(currentFolderId);
        } catch (err) {
            setError(err.response?.data?.message || "Klasor olusturulamadi");
        }
    };

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;
        try {
            if (deleteTarget.type === "folder") {
                await deleteFolder(deleteTarget.id);
            } else {
                await deleteFile(deleteTarget.id);
            }
            setDeleteTarget(null);
            loadContents(currentFolderId);
        } catch (err) {
            setError(err.response?.data?.message || "Silinemedi");
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

    const handleConfirmShare = async () => {
        if (!shareUsername.trim() || !shareTarget) return;
        try {
            await shareWithUser(shareTarget, shareUsername, "VIEW");
            setShareTarget(null);
            setShareUsername("");
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
        <Layout>
            <div className="dashboard-topbar">
                <div>
                    <Typography variant="h4" className="dashboard-title">Dosyalarim</Typography>
                    {!searchResults && (
                        <Breadcrumbs className="breadcrumb-row">
                            {breadcrumb.map((crumb, index) => (
                                <MuiLink
                                    key={crumb.id ?? "root"}
                                    component="button"
                                    underline="hover"
                                    onClick={() => handleBreadcrumbClick(index)}
                                >
                                    {crumb.name}
                                </MuiLink>
                            ))}
                        </Breadcrumbs>
                    )}
                </div>

                <form onSubmit={handleSearch} style={{ display: "flex", gap: 8 }}>
                    <TextField
                        size="small"
                        placeholder="Dosya ara..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Button type="submit" variant="outlined">Ara</Button>
                    {searchResults && (
                        <Button
                            variant="text"
                            onClick={() => {
                                setSearchResults(null);
                                setSearchQuery("");
                            }}
                        >
                            Temizle
                        </Button>
                    )}
                </form>
            </div>

            <div className="section-header">
                <div />
                <div style={{ display: "flex", gap: 8 }}>
                    <Button variant="contained" onClick={() => setNewFolderDialogOpen(true)}>
                        + Yeni Klasor
                    </Button>
                    {currentFolderId && (
                        <>
                            <input
                                type="file"
                                onChange={handleFileUpload}
                                style={{ display: "none" }}
                                id="fileInput"
                            />
                            <Button variant="outlined" onClick={() => document.getElementById("fileInput").click()}>
                                + Dosya Yukle
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {error && <Alert severity="error" style={{ marginBottom: 16 }}>{error}</Alert>}
            {loading && <Typography>Yukleniyor...</Typography>}

            {searchResults ? (
                <>
                    <Typography variant="h6">Arama Sonuclari</Typography>
                    <List>
                        {searchResults.map((file) => (
                            <ListItem
                                key={file.id}
                                secondaryAction={
                                    <IconButton onClick={() => downloadFile(file.id, file.name)}>
                                        <DownloadIcon />
                                    </IconButton>
                                }
                            >
                                <InsertDriveFileIcon style={{ marginRight: 8 }} />
                                <ListItemText primary={file.name} secondary={`${(file.size / 1024).toFixed(1)} KB`} />
                            </ListItem>
                        ))}
                    </List>
                </>
            ) : (
                <>
                    {folders.length > 0 && (
                        <div className="folder-grid">
                            {folders.map((folder) => (
                                <Card key={folder.id} className="folder-card" variant="outlined">
                                    <CardActionArea onClick={() => handleFolderClick(folder)} className="folder-card">
                                        <FolderIcon color="primary" />
                                        <Typography noWrap>{folder.name}</Typography>
                                    </CardActionArea>
                                    <IconButton size="small" onClick={() => setDeleteTarget({ type: "folder", id: folder.id })}>
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Card>
                            ))}
                        </div>
                    )}

                    <List>
                        {files.map((file) => (
                            <ListItem
                                key={file.id}
                                secondaryAction={
                                    <>
                                        <IconButton onClick={() => downloadFile(file.id, file.name)}>
                                            <DownloadIcon />
                                        </IconButton>
                                        <IconButton onClick={() => setShareTarget(file.id)}>
                                            <ShareIcon />
                                        </IconButton>
                                        <IconButton onClick={() => handleCreateLink(file.id)}>
                                            <LinkIcon />
                                        </IconButton>
                                        <IconButton onClick={() => setDeleteTarget({ type: "file", id: file.id })}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </>
                                }
                            >
                                <InsertDriveFileIcon style={{ marginRight: 8 }} />
                                <ListItemText primary={file.name} secondary={`${(file.size / 1024).toFixed(1)} KB`} />
                            </ListItem>
                        ))}
                    </List>
                </>
            )}

            <Dialog open={newFolderDialogOpen} onClose={() => setNewFolderDialogOpen(false)}>
                <DialogTitle>Yeni Klasor</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        fullWidth
                        label="Klasor adi"
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        style={{ marginTop: 8 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setNewFolderDialogOpen(false)}>Iptal</Button>
                    <Button variant="contained" onClick={handleCreateFolder}>Olustur</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
                <DialogTitle>Silmek istediginize emin misiniz?</DialogTitle>
                <DialogActions>
                    <Button onClick={() => setDeleteTarget(null)}>Iptal</Button>
                    <Button color="error" variant="contained" onClick={handleConfirmDelete}>Sil</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={!!shareTarget} onClose={() => setShareTarget(null)}>
                <DialogTitle>Kullanici ile Paylas</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        fullWidth
                        label="Kullanici adi"
                        value={shareUsername}
                        onChange={(e) => setShareUsername(e.target.value)}
                        style={{ marginTop: 8 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShareTarget(null)}>Iptal</Button>
                    <Button variant="contained" onClick={handleConfirmShare}>Paylas</Button>
                </DialogActions>
            </Dialog>
        </Layout>
    );
}

export default Dashboard;