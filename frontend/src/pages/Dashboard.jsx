import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { getFolders, createFolder, deleteFolder, renameFolder, moveFolder } from "../api/folderApi";
import { getFiles, uploadFile, downloadFile, deleteFile, renameFile, moveFile } from "../api/fileApi";
import { search as searchApi } from "../api/searchApi";
import { shareWithUser, createShareLink, getSharesForFile, removeShare, shareFolderWithUser, getSharesForFolder, removeFolderShare } from "../api/shareApi";
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
import Checkbox from "@mui/material/Checkbox";
import Paper from "@mui/material/Paper";
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
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

import "../styles/Dashboard.css";

function Dashboard() {
    const { sharedFolderId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const isReadOnly = !!sharedFolderId;

    const [currentFolderId, setCurrentFolderId] = useState(() => sharedFolderId ?? null);
    const [breadcrumb, setBreadcrumb] = useState(() =>
        sharedFolderId
            ? [{ id: sharedFolderId, name: location.state?.folderName || "Paylaşılan Klasör" }]
            : [{ id: null, name: "Ana Dizin" }]
    );
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
    const [newMenuAnchor, setNewMenuAnchor] = useState(null);

    const [isDragging, setIsDragging] = useState(false);
    const [dragCounter, setDragCounter] = useState(0);

    const [selectedIds, setSelectedIds] = useState(new Set());
    const [bulkMoveDialogOpen, setBulkMoveDialogOpen] = useState(false);
    const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false);

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
        setSelectedIds(new Set());
    }, [currentFolderId]);

    useEffect(() => {
        if (shareTarget) {
            const getShares = shareTarget.type === "folder" ? getSharesForFolder : getSharesForFile;
            getShares(shareTarget.id).then((res) => setCurrentShares(res.data)).catch(() => { });
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

    const JUNK_FILE_NAMES = new Set(["desktop.ini", "thumbs.db", ".ds_store"]);
    const isJunkFile = (name) =>
        JUNK_FILE_NAMES.has(name.toLowerCase()) || name.startsWith(".") || name.startsWith("~$");

    const uploadEntries = async (entries) => {
        if (entries.length === 0) return;
        setLoading(true);
        setError("");
        const failedFiles = [];
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

            for (const { file, relativePath } of entries) {
                const lastSlash = relativePath.lastIndexOf("/");
                const dirPath = lastSlash === -1 ? "" : relativePath.substring(0, lastSlash);
                try {
                    const targetFolderId = await ensureFolder(dirPath);
                    await uploadFile(targetFolderId, file);
                } catch (err) {
                    failedFiles.push(file.name);
                }
            }

            await loadContents(currentFolderId);

            if (failedFiles.length > 0) {
                setError(`${failedFiles.length} dosya yüklenemedi: ${failedFiles.join(", ")}`);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Yükleme başarısız");
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e) => {
        const fileList = Array.from(e.target.files).filter((file) => !isJunkFile(file.name));
        await uploadEntries(fileList.map((file) => ({ file, relativePath: file.name })));
        e.target.value = "";
    };

    const handleFolderUpload = async (e) => {
        const fileList = Array.from(e.target.files).filter((file) => !isJunkFile(file.name));
        await uploadEntries(fileList.map((file) => ({ file, relativePath: file.webkitRelativePath || file.name })));
        e.target.value = "";
    };

    const traverseFileTreeEntry = (entry, basePath, collected) => {
        return new Promise((resolve) => {
            if (entry.isFile) {
                entry.file((file) => {
                    if (!isJunkFile(file.name)) {
                        collected.push({ file, relativePath: basePath + file.name });
                    }
                    resolve();
                }, () => resolve());
            } else if (entry.isDirectory) {
                const dirReader = entry.createReader();
                const readBatch = () => {
                    dirReader.readEntries(async (children) => {
                        if (children.length === 0) {
                            resolve();
                            return;
                        }
                        for (const child of children) {
                            await traverseFileTreeEntry(child, basePath + entry.name + "/", collected);
                        }
                        readBatch();
                    }, () => resolve());
                };
                readBatch();
            } else {
                resolve();
            }
        });
    };

    const handleDragEnter = (e) => {
        e.preventDefault();
        if (isReadOnly) return;
        setDragCounter((c) => c + 1);
        setIsDragging(true);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        if (isReadOnly) return;
        setDragCounter((c) => {
            const next = c - 1;
            if (next <= 0) setIsDragging(false);
            return next;
        });
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        setIsDragging(false);
        setDragCounter(0);
        if (isReadOnly) return;

        const items = e.dataTransfer.items;
        if (!items || items.length === 0) return;

        const entries = [];
        for (let i = 0; i < items.length; i++) {
            const entry = items[i].webkitGetAsEntry?.();
            if (entry) entries.push(entry);
        }

        const collected = [];
        for (const entry of entries) {
            await traverseFileTreeEntry(entry, "", collected);
        }

        await uploadEntries(collected);
    };

    const handleConfirmShare = async () => {
        if (!shareEmail.trim() || !shareTarget) return;
        try {
            if (shareTarget.type === "folder") {
                await shareFolderWithUser(shareTarget.id, shareEmail, "DOWNLOAD");
                const res = await getSharesForFolder(shareTarget.id);
                setCurrentShares(res.data);
            } else {
                await shareWithUser(shareTarget.id, shareEmail, "DOWNLOAD");
                const res = await getSharesForFile(shareTarget.id);
                setCurrentShares(res.data);
            }
            setShareEmail("");
        } catch (err) {
            setError(err.response?.data?.message || "Paylaşılamadı");
        }
    };

    const handleRemoveShare = async (shareId) => {
        try {
            if (shareTarget?.type === "folder") {
                await removeFolderShare(shareId);
            } else {
                await removeShare(shareId);
            }
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
            const res = await searchApi(searchQuery);
            setSearchResults(res.data);
        } catch (err) {
            setError(err.response?.data?.message || "Arama başarısız");
        }
    };

    const handleClearSearch = () => {
        setSearchQuery("");
        setSearchResults(null);
    };

    const handleSearchOwnFolderClick = (folder) => {
        setSearchQuery("");
        setSearchResults(null);
        setCurrentFolderId(folder.id);
        setBreadcrumb([{ id: null, name: "Ana Dizin" }, { id: folder.id, name: folder.name }]);
    };

    const handleSearchSharedFolderClick = (sharedFolder) => {
        navigate(`/dashboard/shared/${sharedFolder.folderId}`, {
            state: { folderName: sharedFolder.folderName },
        });
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

    const selectionKey = (type, id) => `${type}:${id}`;

    const toggleSelect = (type, id) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            const key = selectionKey(type, id);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    const clearSelection = () => setSelectedIds(new Set());

    const handleBulkDelete = async () => {
        for (const key of selectedIds) {
            const [type, id] = key.split(":");
            try {
                if (type === "folder") {
                    await deleteFolder(id);
                } else {
                    await deleteFile(id);
                }
            } catch (err) {
                // continue deleting remaining items even if one fails
            }
        }
        setBulkDeleteConfirmOpen(false);
        clearSelection();
        loadContents(currentFolderId);
    };

    const handleBulkMove = async (targetFolderId) => {
        if (!targetFolderId) return;
        for (const key of selectedIds) {
            const [type, id] = key.split(":");
            try {
                if (type === "folder") {
                    await moveFolder(id, targetFolderId);
                } else {
                    await moveFile(id, targetFolderId);
                }
            } catch (err) {
                // continue moving remaining items even if one fails
            }
        }
        setBulkMoveDialogOpen(false);
        clearSelection();
        loadContents(currentFolderId);
    };

    return (
        <Layout
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            onSearchSubmit={handleSearch}
            onClearSearch={handleClearSearch}
            searchPlaceholder="Dosya ara..."
        >
            <div
                className="dashboard-dropzone"
                style={{ position: "relative" }}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {isDragging && !isReadOnly && (
                    <div
                        style={{
                            position: "absolute",
                            inset: 0,
                            zIndex: 10,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 8,
                            background: "rgba(25, 118, 210, 0.08)",
                            border: "2px dashed #1976d2",
                            borderRadius: 8,
                            pointerEvents: "none",
                        }}
                    >
                        <CloudUploadIcon sx={{ fontSize: 48, color: "#1976d2" }} />
                        <Typography variant="h6" sx={{ color: "#1976d2" }}>Yüklemek için dosyaları buraya bırakın</Typography>
                    </div>
                )}

                {selectedIds.size > 0 && (
                    <Paper
                        variant="outlined"
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            p: 1.5,
                            mb: 2,
                        }}
                    >
                        <Typography variant="body2">{selectedIds.size} öğe seçildi</Typography>
                        <Button size="small" startIcon={<DriveFileMoveIcon />} onClick={() => setBulkMoveDialogOpen(true)}>
                            Taşı
                        </Button>
                        <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => setBulkDeleteConfirmOpen(true)}>
                            Sil
                        </Button>
                        <Button size="small" onClick={clearSelection}>Seçimi Kaldır</Button>
                    </Paper>
                )}

            <div className="dashboard-topbar">
                <div>
                    <Typography variant="h4" className="dashboard-title">
                        {isReadOnly ? "Paylaşılan Klasör" : "Dosyalarım"}
                    </Typography>
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

                {!isReadOnly && (
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
                            multiple
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
                )}
            </div>

            {error && <Alert severity="error" style={{ marginBottom: 16 }}>{error}</Alert>}
            {loading && <Typography>Yükleniyor...</Typography>}

            {searchResults ? (
                <>
                    <Typography variant="h6">Arama Sonuçları</Typography>
                    {searchResults.ownFolders.length === 0 &&
                        searchResults.ownFiles.length === 0 &&
                        searchResults.sharedFolders.length === 0 &&
                        searchResults.sharedFiles.length === 0 && (
                            <Typography color="text.secondary" sx={{ mt: 2 }}>Sonuç bulunamadı</Typography>
                        )}

                    {searchResults.ownFolders.length > 0 && (
                        <>
                            <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>Klasörlerim</Typography>
                            <List>
                                {searchResults.ownFolders.map((folder) => (
                                    <ListItem key={folder.id} button onClick={() => handleSearchOwnFolderClick(folder)}>
                                        <ListItemIcon><FolderIcon color="primary" /></ListItemIcon>
                                        <ListItemText primary={folder.name} />
                                    </ListItem>
                                ))}
                            </List>
                        </>
                    )}

                    {searchResults.ownFiles.length > 0 && (
                        <>
                            <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>Dosyalarım</Typography>
                            <List>
                                {searchResults.ownFiles.map((file) => (
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
                    )}

                    {searchResults.sharedFolders.length > 0 && (
                        <>
                            <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>Benimle Paylaşılan Klasörler</Typography>
                            <List>
                                {searchResults.sharedFolders.map((share) => (
                                    <ListItem key={share.id} button onClick={() => handleSearchSharedFolderClick(share)}>
                                        <ListItemIcon><FolderIcon color="primary" /></ListItemIcon>
                                        <ListItemText primary={share.folderName} secondary={`Paylaşan: ${share.sharedByUsername}`} />
                                    </ListItem>
                                ))}
                            </List>
                        </>
                    )}

                    {searchResults.sharedFiles.length > 0 && (
                        <>
                            <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>Benimle Paylaşılan Dosyalar</Typography>
                            <List>
                                {searchResults.sharedFiles.map((share) => (
                                    <ListItem
                                        key={share.id}
                                        secondaryAction={
                                            <IconButton onClick={() => downloadFile(share.fileId, share.fileName)}>
                                                <DownloadIcon />
                                            </IconButton>
                                        }
                                    >
                                        <ListItemText primary={share.fileName} secondary={`Paylaşan: ${share.sharedByUsername}`} />
                                    </ListItem>
                                ))}
                            </List>
                        </>
                    )}
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
                                        {!isReadOnly && (
                                            <Checkbox
                                                size="small"
                                                checked={selectedIds.has(selectionKey("folder", folder.id))}
                                                onClick={(e) => e.stopPropagation()}
                                                onChange={() => toggleSelect("folder", folder.id)}
                                                sx={{ position: "absolute", top: 4, left: 4 }}
                                            />
                                        )}
                                        {!isReadOnly && (
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
                                        )}
                                    </Card>
                                ))
                            ) : (
                                <List>
                                    {folders.map((folder) => (
                                        <ListItem
                                            key={folder.id}
                                            secondaryAction={
                                                !isReadOnly && (
                                                    <IconButton onClick={(e) => openMenu(e, { type: "folder", id: folder.id, name: folder.name })}>
                                                        <MoreVertIcon />
                                                    </IconButton>
                                                )
                                            }
                                        >
                                            {!isReadOnly && (
                                                <Checkbox
                                                    size="small"
                                                    checked={selectedIds.has(selectionKey("folder", folder.id))}
                                                    onChange={() => toggleSelect("folder", folder.id)}
                                                />
                                            )}
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
                                    {!isReadOnly && (
                                        <Checkbox
                                            size="small"
                                            checked={selectedIds.has(selectionKey("file", file.id))}
                                            onChange={() => toggleSelect("file", file.id)}
                                        />
                                    )}
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
                                    {!isReadOnly && (
                                        <Checkbox
                                            size="small"
                                            checked={selectedIds.has(selectionKey("file", file.id))}
                                            onChange={() => toggleSelect("file", file.id)}
                                        />
                                    )}
                                    <span style={{ marginRight: 8, display: "flex" }}>{getFileIcon(file.extension)}</span>
                                    <ListItemText primary={file.name} secondary={`${(file.size / 1024).toFixed(1)} KB`} />
                                </ListItem>
                            ))}
                        </List>
                    )}
                </>
            )}
            </div>

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
                <DialogTitle>{shareTarget?.type === "folder" ? "Klasörü Paylaş" : "Dosyayı Paylaş"}</DialogTitle>
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
                    <Button
                        fullWidth
                        variant="contained"
                        sx={{ mt: 1 }}
                        onClick={handleConfirmShare}
                        disabled={!shareEmail.trim()}
                    >
                        Paylaş
                    </Button>

                    {shareTarget?.type !== "folder" && (
                        <>
                            <Divider sx={{ my: 2 }} />

                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                Link ile paylaş
                            </Typography>
                            <Button
                                fullWidth
                                variant="outlined"
                                startIcon={<LinkIcon />}
                                onClick={() => handleCreateLink(shareTarget.id)}
                            >
                                İndirme linki oluştur (24 saat geçerli)
                            </Button>
                        </>
                    )}

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
                                        <ListItemText primary={s.sharedWithUsername} />
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

            <MoveDialog
                open={bulkMoveDialogOpen}
                onClose={() => setBulkMoveDialogOpen(false)}
                onConfirm={handleBulkMove}
            />

            <Dialog open={bulkDeleteConfirmOpen} onClose={() => setBulkDeleteConfirmOpen(false)}>
                <DialogTitle>{selectedIds.size} öğeyi silmek istediğinize emin misiniz?</DialogTitle>
                <DialogActions>
                    <Button onClick={() => setBulkDeleteConfirmOpen(false)}>İptal</Button>
                    <Button color="error" variant="contained" onClick={handleBulkDelete}>Sil</Button>
                </DialogActions>
            </Dialog>

            <Menu anchorEl={menuAnchor} open={!!menuAnchor} onClose={closeMenu}>
                {menuTarget?.type === "file" && (
                    <MenuItem onClick={() => { downloadFile(menuTarget.id, menuTarget.name); closeMenu(); }}>
                        <ListItemIcon><DownloadIcon fontSize="small" /></ListItemIcon>
                        İndir
                    </MenuItem>
                )}
                {!isReadOnly && (menuTarget?.type === "file" || menuTarget?.type === "folder") && (
                    <MenuItem onClick={() => { setShareTarget({ type: menuTarget.type, id: menuTarget.id, name: menuTarget.name }); closeMenu(); }}>
                        <ListItemIcon><ShareIcon fontSize="small" /></ListItemIcon>
                        Paylaş
                    </MenuItem>
                )}
                {!isReadOnly && (
                    <MenuItem onClick={handleOpenRename}>
                        <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
                        Yeniden Adlandır
                    </MenuItem>
                )}
                {!isReadOnly && (
                    <MenuItem onClick={handleOpenMove}>
                        <ListItemIcon><DriveFileMoveIcon fontSize="small" /></ListItemIcon>
                        Taşı
                    </MenuItem>
                )}
                {!isReadOnly && menuTarget?.type === "file" && (
                    <MenuItem onClick={() => handleToggleStar(menuTarget.id)}>
                        <ListItemIcon>
                            {menuTarget?.starred ? <StarIcon fontSize="small" sx={{ color: "#FFB400" }} /> : <StarBorderIcon fontSize="small" />}
                        </ListItemIcon>
                        {menuTarget?.starred ? "Yıldızı Kaldır" : "Yıldızla"}
                    </MenuItem>
                )}
                {!isReadOnly && (
                    <MenuItem onClick={() => { setDeleteTarget(menuTarget); closeMenu(); }}>
                        <ListItemIcon><DeleteIcon fontSize="small" /></ListItemIcon>
                        Sil
                    </MenuItem>
                )}
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