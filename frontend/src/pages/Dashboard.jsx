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
import { toggleStar } from "../api/fileApi";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import CreateNewFolderIcon from "@mui/icons-material/CreateNewFolder";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DriveFolderUploadIcon from "@mui/icons-material/DriveFolderUpload";

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
    const [sharePermission, setSharePermission] = useState("VIEW");
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
    const [newMenuAnchor, setNewMenuAnchor] = useState(null);

    const loadContents = async (folderId) => {
        setLoading(true);
        setError("");
        try {
            const foldersRes = await getFolders(folderId);
            setFolders(foldersRes.data);

            const filesRes = await getFiles(folderId);
            setFiles(filesRes.data);
        } catch (err) {
            setError(err.response?.data?.message || "İçerik yüklenemedi");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadContents(currentFolderId);
    }, [currentFolderId]);

    useEffect(() => {
        if (shareTarget) {
            getSharesForFile(shareTarget).then((res) => setCurrentShares(res.data)).catch(() => { });
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
            setError(err.response?.data?.message || "Klasör oluşturulamadı");
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
        if (!file) return;
        try {
            await uploadFile(currentFolderId, file);
            loadContents(currentFolderId);
        } catch (err) {
            setError(err.response?.data?.message || "Dosya yüklenemedi");
        }
        e.target.value = "";
    };

    const handleFolderUpload = async (e) => {
        const fileList = Array.from(e.target.files);
        if (fileList.length === 0) return;

        setLoading(true);
        setError("");
        try {
            const folderIdCache = new Map([["", currentFolderId]]);

            const ensureFolder = async (path) => {
                if (folderIdCache.has(path)) return folderIdCache.get(path);
                const slashIndex = path.lastIndexOf("/");
                const parentPath = slashIndex === -1 ? "" : path.substring(0, slashIndex);
                const folderName = slashIndex === -1 ? path : path.substring(slashIndex + 1);
                const parentId = await ensureFolder(parentPath);
                const res = await createFolder(folderName, parentId);
                folderIdCache.set(path, res.data.id);
                return res.data.id;
            };

            for (const file of fileList) {
                const relativePath = file.webkitRelativePath || file.name;
                const lastSlash = relativePath.lastIndexOf("/");
                const dirPath = lastSlash === -1 ? "" : relativePath.substring(0, lastSlash);
                const targetFolderId = await ensureFolder(dirPath);
                await uploadFile(targetFolderId, file);
            }

            loadContents(currentFolderId);
        } catch (err) {
            setError(err.response?.data?.message || "Klasör yüklenemedi");
        } finally {
            setLoading(false);
        }
        e.target.value = "";
    };

    const handleConfirmShare = async () => {
        if (!shareEmail.trim() || !shareTarget) return;
        try {
            await shareWithUser(shareTarget, shareEmail, sharePermission);
            setShareEmail("");
            const res = await getSharesForFile(shareTarget);
            setCurrentShares(res.data);
        } catch (err) {
            setError(err.response?.data?.message || "Paylaşılamadı");
        }
    };

    const handleRemoveShare = async (shareId) => {
        try {
            await removeShare(shareId);
            setCurrentShares(currentShares.filter((s) => s.id !== shareId));
        } catch (err) {
            setError(err.response?.data?.message || "Paylaşım kaldırılamadı");
        }
    };

    const handleCreateLink = async (fileId) => {
        try {
            const res = await createShareLink(fileId, "DOWNLOAD", 24);
            const link = `${window.location.origin}/share/${res.data.token}`;
            navigator.clipboard.writeText(link);
            setSnackbarMessage("Link kopyalandı (24 saat geçerli)");
        } catch (err) {
            setError(err.response?.data?.message || "Link oluşturulamadı");
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            setSearchResults(null);
            return;
        }
        try {
            const res = await searchFiles(searchQuery);
            setSearchResults(res.data);
        } catch (err) {
            setError(err.response?.data?.message || "Arama başarısız");
        }
    };

    const handleClearSearch = () => {
        setSearchQuery("");
        setSearchResults(null);
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
            setError(err.response?.data?.message || "Yeniden adlandırılamadı");
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
            setError(err.response?.data?.message || "Taşınamadı");
        }
    };

    const handleToggleStar = async (fileId) => {
        try {
            await toggleStar(fileId);
            loadContents(currentFolderId);
        } catch (err) {
            setError(err.response?.data?.message || "İşlem başarısız");
        }
        closeMenu();
    };

    return (
        <Layout
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            onSearchSubmit={handleSearch}
            onClearSearch={handleClearSearch}
            searchPlaceholder="Dosya ara..."
        >
            <div className="dashboard-topbar">
                <div>
                    <Typography variant="h4" className="dashboard-title">Dosyalarım</Typography>
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

                <div>
                    <Button
                        variant="contained"
                        endIcon={<ArrowDropDownIcon />}
                        onClick={(e) => setNewMenuAnchor(e.currentTarget)}
                    >
                        + New
                    </Button>
                    <Menu anchorEl={newMenuAnchor} open={!!newMenuAnchor} onClose={() => setNewMenuAnchor(null)}>
                        <MenuItem onClick={() => { setNewFolderDialogOpen(true); setNewMenuAnchor(null); }}>
                            <ListItemIcon><CreateNewFolderIcon fontSize="small" /></ListItemIcon>
                            Yeni Klasör
                        </MenuItem>
                        <MenuItem onClick={() => { document.getElementById("fileInput").click(); setNewMenuAnchor(null); }}>
                            <ListItemIcon><UploadFileIcon fontSize="small" /></ListItemIcon>
                            Dosya Yükle
                        </MenuItem>
                        <MenuItem onClick={() => { document.getElementById("folderInput").click(); setNewMenuAnchor(null); }}>
                            <ListItemIcon><DriveFolderUploadIcon fontSize="small" /></ListItemIcon>
                            Klasör Yükle
                        </MenuItem>
                    </Menu>
                    <input
                        type="file"
                        onChange={handleFileUpload}
                        style={{ display: "none" }}
                        id="fileInput"
                    />
                    <input
                        type="file"
                        webkitdirectory=""
                        directory=""
                        multiple
                        onChange={handleFolderUpload}
                        style={{ display: "none" }}
                        id="folderInput"
                    />
                </div>
            </div>

            {error && <Alert severity="error" style={{ marginBottom: 16 }}>{error}</Alert>}
            {loading && <Typography>Yükleniyor...</Typography>}

            {searchResults ? (
                <>
                    <Typography variant="h6">Arama Sonuçları</Typography>
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
                        <div className={viewMode === "grid" ? "folder-grid" : "folder-list"}>
                            {viewMode === "grid" ? (
                                folders.map((folder) => (
                                    <Card
                                        key={folder.id}
                                        variant="outlined"
                                        sx={{
                                            position: "relative",
                                            transition: "box-shadow 0.2s",
                                            "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.1)" },
                                        }}
                                    >
                                        <CardActionArea
                                            onClick={() => handleFolderClick(folder)}
                                            sx={{
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                                gap: 1.5,
                                                padding: "28px 16px 20px",
                                                textAlign: "center",
                                            }}
                                        >
                                            <FolderIcon color="primary" sx={{ fontSize: 40 }} />
                                            <Typography noWrap sx={{ maxWidth: "100%" }}>{folder.name}</Typography>
                                        </CardActionArea>
                                        <IconButton
                                            size="small"
                                            sx={{ position: "absolute", top: 8, right: 8 }}
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

                    <div className="section-header">
                        <Typography variant="subtitle1" className="section-label">Dosyalar</Typography>
                        <ToggleButtonGroup
                            size="small"
                            value={viewMode}
                            exclusive
                            onChange={(e, newMode) => newMode && setViewMode(newMode)}
                        >
                            <ToggleButton value="grid"><GridViewIcon fontSize="small" /></ToggleButton>
                            <ToggleButton value="list"><ViewListIcon fontSize="small" /></ToggleButton>
                        </ToggleButtonGroup>
                    </div>

                    {viewMode === "grid" ? (
                        <div className="file-grid">
                            {files.map((file) => (
                                <div className="file-row" key={file.id}>
                                    <span className="file-row-icon">{getFileIcon(file.extension)}</span>
                                    <div className="file-row-info">
                                        <Typography variant="body2" noWrap className="file-row-name">{file.name}</Typography>
                                        <Typography variant="caption" color="text.secondary" noWrap>
                                            {(file.size / 1024).toFixed(1)} KB
                                        </Typography>
                                    </div>
                                    <IconButton
                                        size="small"
                                        onClick={(e) => openMenu(e, { type: "file", id: file.id, name: file.name, starred: file.starred })}
                                    >
                                        <MoreVertIcon fontSize="small" />
                                    </IconButton>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <List>
                            {files.map((file) => (
                                <ListItem
                                    key={file.id}
                                    secondaryAction={
                                        <IconButton onClick={(e) => openMenu(e, { type: "file", id: file.id, name: file.name, starred: file.starred })}>
                                            <MoreVertIcon />
                                        </IconButton>
                                    }
                                >
                                    <span style={{ marginRight: 8, display: "flex" }}>{getFileIcon(file.extension)}</span>
                                    <ListItemText primary={file.name} secondary={`${(file.size / 1024).toFixed(1)} KB`} />
                                </ListItem>
                            ))}
                        </List>
                    )}
                </>
            )}

            <Dialog open={newFolderDialogOpen} onClose={() => setNewFolderDialogOpen(false)}>
                <DialogTitle>Yeni Klasör</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        fullWidth
                        label="Klasör adı"
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        style={{ marginTop: 8 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setNewFolderDialogOpen(false)}>İptal</Button>
                    <Button variant="contained" onClick={handleCreateFolder}>Oluştur</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
                <DialogTitle>Silmek istediğinize emin misiniz?</DialogTitle>
                <DialogActions>
                    <Button onClick={() => setDeleteTarget(null)}>İptal</Button>
                    <Button color="error" variant="contained" onClick={handleConfirmDelete}>Sil</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={!!shareTarget} onClose={() => setShareTarget(null)} fullWidth maxWidth="xs">
                <DialogTitle>Dosyayı Paylaş</DialogTitle>
                <DialogContent>
                    <Typography variant="subtitle2" sx={{ mt: 1, mb: 1 }}>
                        Kullanıcı ile paylaş
                    </Typography>
                    <TextField
                        autoFocus
                        fullWidth
                        size="small"
                        label="Email"
                        value={shareEmail}
                        onChange={(e) => setShareEmail(e.target.value)}
                        sx={{ mb: 1 }}
                    />
                    <TextField
                        select
                        fullWidth
                        size="small"
                        label="İzin"
                        value={sharePermission}
                        onChange={(e) => setSharePermission(e.target.value)}
                    >
                        <MenuItem value="VIEW">Görüntüleme</MenuItem>
                        <MenuItem value="DOWNLOAD">İndirme</MenuItem>
                    </TextField>
                    <Button
                        fullWidth
                        variant="contained"
                        sx={{ mt: 1 }}
                        onClick={handleConfirmShare}
                        disabled={!shareEmail.trim()}
                    >
                        Paylaş
                    </Button>

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Link ile paylaş
                    </Typography>
                    <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<LinkIcon />}
                        onClick={() => handleCreateLink(shareTarget)}
                    >
                        İndirme linki oluştur (24 saat geçerli)
                    </Button>

                    {currentShares.length > 0 && (
                        <>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                Paylaşılan kişiler
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
                <DialogTitle>Yeniden Adlandır</DialogTitle>
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
                    <Button onClick={() => setRenameDialogOpen(false)}>İptal</Button>
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
                        İndir
                    </MenuItem>
                )}
                {menuTarget?.type === "file" && (
                    <MenuItem onClick={() => { setShareTarget(menuTarget.id); closeMenu(); }}>
                        <ListItemIcon><ShareIcon fontSize="small" /></ListItemIcon>
                        Paylaş
                    </MenuItem>
                )}
                <MenuItem onClick={handleOpenRename}>
                    <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
                    Yeniden Adlandır
                </MenuItem>
                <MenuItem onClick={handleOpenMove}>
                    <ListItemIcon><DriveFileMoveIcon fontSize="small" /></ListItemIcon>
                    Taşı
                </MenuItem>
                <MenuItem onClick={() => handleToggleStar(menuTarget.id)}>
                    <ListItemIcon>
                        {menuTarget?.starred ? <StarIcon fontSize="small" sx={{ color: "#FFB400" }} /> : <StarBorderIcon fontSize="small" />}
                    </ListItemIcon>
                    {menuTarget?.starred ? "Yıldızı Kaldır" : "Yıldızla"}
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