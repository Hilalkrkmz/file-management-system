import { useState, useEffect } from "react";
import { getFolders, createFolder, deleteFolder, renameFolder, moveFolder } from "../api/folderApi";
import { getFiles, uploadFile, downloadFile, deleteFile, searchFiles, renameFile, moveFile } from "../api/fileApi";
import { shareWithUser, createShareLink, getSharesForFile, removeShare } from "../api/shareApi";
import { getFileIcon } from "../utils/fileIcons.jsx";
import Layout from "../components/Layout.jsx";
import MoveDialog from "../components/MoveDialog.jsx";

import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import IconButton from "@mui/material/IconButton";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import MuiLink from "@mui/material/Link";
import Alert from "@mui/material/Alert";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Divider from "@mui/material/Divider";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Snackbar from "@mui/material/Snackbar";
import Avatar from "@mui/material/Avatar";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import FolderIcon from "@mui/icons-material/Folder";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import ShareIcon from "@mui/icons-material/Share";
import LinkIcon from "@mui/icons-material/Link";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DriveFileMoveIcon from "@mui/icons-material/DriveFileMove";
import GridViewIcon from "@mui/icons-material/GridView";
import ViewListIcon from "@mui/icons-material/ViewList";

import "../styles/Dashboard.css";

function Dashboard() {
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
    const [shareEmail, setShareEmail] = useState("");
    const [currentShares, setCurrentShares] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState(null);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [viewMode, setViewMode] = useState("grid");

    const [menuAnchor, setMenuAnchor] = useState(null);
    const [menuTarget, setMenuTarget] = useState(null);
    const [renameDialogOpen, setRenameDialogOpen] = useState(false);
    const [renameValue, setRenameValue] = useState("");
    const [moveDialogOpen, setMoveDialogOpen] = useState(false);

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

    useEffect(() => {
        if (shareTarget) {
            getSharesForFile(shareTarget).then((res) => setCurrentShares(res.data)).catch(() => {});
        } else {
            setCurrentShares([]);
        }
    }, [shareTarget]);

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
        if (!shareEmail.trim() || !shareTarget) return;
        try {
            await shareWithUser(shareTarget, shareEmail, "VIEW");
            setShareEmail("");
            const res = await getSharesForFile(shareTarget);
            setCurrentShares(res.data);
        } catch (err) {
            setError(err.response?.data?.message || "Paylasilamadi");
        }
    };

    const handleRemoveShare = async (shareId) => {
        try {
            await removeShare(shareId);
            setCurrentShares(currentShares.filter((s) => s.id !== shareId));
        } catch (err) {
            setError(err.response?.data?.message || "Paylasim kaldirilamadi");
        }
    };

    const handleCreateLink = async (fileId) => {
        try {
            const res = await createShareLink(fileId, "DOWNLOAD", 24);
            const link = `${window.location.origin}/share/${res.data.token}`;
            navigator.clipboard.writeText(link);
            setSnackbarMessage("Link kopyalandi (24 saat gecerli)");
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

    const openMenu = (e, target) => {
        setMenuAnchor(e.currentTarget);
        setMenuTarget(target);
    };

    const closeMenu = () => {
        setMenuAnchor(null);
    };

    const handleOpenRename = () => {
        setRenameValue(menuTarget.name);
        setRenameDialogOpen(true);
        closeMenu();
    };

    const handleConfirmRename = async () => {
        if (!renameValue.trim() || !menuTarget) return;
        try {
            if (menuTarget.type === "folder") {
                await renameFolder(menuTarget.id, renameValue);
            } else {
                await renameFile(menuTarget.id, renameValue);
            }
            setRenameDialogOpen(false);
            loadContents(currentFolderId);
        } catch (err) {
            setError(err.response?.data?.message || "Yeniden adlandirilamadi");
        }
    };

    const handleOpenMove = () => {
        setMoveDialogOpen(true);
        closeMenu();
    };

    const handleConfirmMove = async (targetFolderId) => {
        if (!menuTarget || !targetFolderId) return;
        try {
            if (menuTarget.type === "folder") {
                await moveFolder(menuTarget.id, targetFolderId);
            } else {
                await moveFile(menuTarget.id, targetFolderId);
            }
            setMoveDialogOpen(false);
            loadContents(currentFolderId);
        } catch (err) {
            setError(err.response?.data?.message || "Tasinamadi");
        }
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
                <ToggleButtonGroup
                    size="small"
                    value={viewMode}
                    exclusive
                    onChange={(e, newMode) => newMode && setViewMode(newMode)}
                >
                    <ToggleButton value="grid"><GridViewIcon fontSize="small" /></ToggleButton>
                    <ToggleButton value="list"><ViewListIcon fontSize="small" /></ToggleButton>
                </ToggleButtonGroup>
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
                                <span style={{ marginRight: 8, display: "flex" }}>{getFileIcon(file.extension)}</span>
                                <ListItemText primary={file.name} secondary={`${(file.size / 1024).toFixed(1)} KB`} />
                            </ListItem>
                        ))}
                    </List>
                </>
            ) : (
                <>
                    {folders.length > 0 && (
                        <div className={viewMode === "grid" ? "folder-grid" : ""}>
                            {viewMode === "grid" ? (
                                folders.map((folder) => (
                                    <Card key={folder.id} className="folder-card" variant="outlined">
                                        <CardActionArea onClick={() => handleFolderClick(folder)} className="folder-card">
                                            <FolderIcon color="primary" />
                                            <Typography noWrap>{folder.name}</Typography>
                                        </CardActionArea>
                                        <IconButton
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openMenu(e, { type: "folder", id: folder.id, name: folder.name });
                                            }}
                                        >
                                            <MoreVertIcon fontSize="small" />
                                        </IconButton>
                                    </Card>
                                ))
                            ) : (
                                <List>
                                    {folders.map((folder) => (
                                        <ListItem
                                            key={folder.id}
                                            secondaryAction={
                                                <IconButton onClick={(e) => openMenu(e, { type: "folder", id: folder.id, name: folder.name })}>
                                                    <MoreVertIcon />
                                                </IconButton>
                                            }
                                        >
                                            <FolderIcon color="primary" style={{ marginRight: 8 }} />
                                            <ListItemText
                                                primary={folder.name}
                                                onClick={() => handleFolderClick(folder)}
                                                style={{ cursor: "pointer" }}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            )}
                        </div>
                    )}

                    <List>
                        {files.map((file) => (
                            <ListItem
                                key={file.id}
                                secondaryAction={
                                    <IconButton onClick={(e) => openMenu(e, { type: "file", id: file.id, name: file.name })}>
                                        <MoreVertIcon />
                                    </IconButton>
                                }
                            >
                                <span style={{ marginRight: 8, display: "flex" }}>{getFileIcon(file.extension)}</span>
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

            <Dialog open={!!shareTarget} onClose={() => setShareTarget(null)} fullWidth maxWidth="xs">
                <DialogTitle>Dosyayi Paylas</DialogTitle>
                <DialogContent>
                    <Typography variant="subtitle2" sx={{ mt: 1, mb: 1 }}>
                        Kullanici ile paylas
                    </Typography>
                    <TextField
                        autoFocus
                        fullWidth
                        size="small"
                        label="Email"
                        value={shareEmail}
                        onChange={(e) => setShareEmail(e.target.value)}
                    />
                    <Button
                        fullWidth
                        variant="contained"
                        sx={{ mt: 1 }}
                        onClick={handleConfirmShare}
                        disabled={!shareEmail.trim()}
                    >
                        Paylas
                    </Button>

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Link ile paylas
                    </Typography>
                    <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<LinkIcon />}
                        onClick={() => handleCreateLink(shareTarget)}
                    >
                        Indirme linki olustur (24 saat gecerli)
                    </Button>

                    {currentShares.length > 0 && (
                        <>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                Paylasilan kisiler
                            </Typography>
                            <List dense>
                                {currentShares.map((s) => (
                                    <ListItem
                                        key={s.id}
                                        secondaryAction={
                                            <IconButton size="small" onClick={() => handleRemoveShare(s.id)}>
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        }
                                    >
                                        <Avatar sx={{ width: 28, height: 28, mr: 1, fontSize: 14 }}>
                                            {s.sharedWithUsername?.[0]?.toUpperCase()}
                                        </Avatar>
                                        <ListItemText primary={s.sharedWithUsername} secondary={s.permission} />
                                    </ListItem>
                                ))}
                            </List>
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShareTarget(null)}>Kapat</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={renameDialogOpen} onClose={() => setRenameDialogOpen(false)}>
                <DialogTitle>Yeniden Adlandir</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        fullWidth
                        label="Yeni ad"
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        style={{ marginTop: 8 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRenameDialogOpen(false)}>Iptal</Button>
                    <Button variant="contained" onClick={handleConfirmRename}>Kaydet</Button>
                </DialogActions>
            </Dialog>

            <MoveDialog
                open={moveDialogOpen}
                onClose={() => setMoveDialogOpen(false)}
                onConfirm={handleConfirmMove}
            />

            <Menu anchorEl={menuAnchor} open={!!menuAnchor} onClose={closeMenu}>
                {menuTarget?.type === "file" && (
                    <MenuItem onClick={() => { downloadFile(menuTarget.id, menuTarget.name); closeMenu(); }}>
                        <ListItemIcon><DownloadIcon fontSize="small" /></ListItemIcon>
                        Indir
                    </MenuItem>
                )}
                {menuTarget?.type === "file" && (
                    <MenuItem onClick={() => { setShareTarget(menuTarget.id); closeMenu(); }}>
                        <ListItemIcon><ShareIcon fontSize="small" /></ListItemIcon>
                        Paylas
                    </MenuItem>
                )}
                <MenuItem onClick={handleOpenRename}>
                    <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
                    Yeniden Adlandir
                </MenuItem>
                <MenuItem onClick={handleOpenMove}>
                    <ListItemIcon><DriveFileMoveIcon fontSize="small" /></ListItemIcon>
                    Tasi
                </MenuItem>
                <MenuItem onClick={() => { setDeleteTarget(menuTarget); closeMenu(); }}>
                    <ListItemIcon><DeleteIcon fontSize="small" /></ListItemIcon>
                    Sil
                </MenuItem>
            </Menu>

            <Snackbar
                open={!!snackbarMessage}
                autoHideDuration={3000}
                onClose={() => setSnackbarMessage("")}
                message={snackbarMessage}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            />
        </Layout>
    );
}

export default Dashboard;