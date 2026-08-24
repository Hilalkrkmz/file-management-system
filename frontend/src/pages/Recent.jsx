import { useState, useEffect, useMemo } from "react";
import { getRecentFiles, downloadFile, deleteFile } from "../api/fileApi";
import { getFileIcon } from "../utils/fileIcons.jsx";
import { getFileCategory, CATEGORY_LABELS } from "../utils/fileCategory.js";
import Layout from "../components/Layout.jsx";
import FilterPill from "../components/FilterPill.jsx";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";

function groupLabel(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);

    if (isToday) return "Bugün";
    if (isYesterday) return "Dün";
    if (date > weekAgo) return "Son Hafta";
    return date.toLocaleDateString("tr-TR", { day: "numeric", month: "long" });
}

function formatTime(dateStr) {
    return new Date(dateStr).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
}

function Recent() {
    const [files, setFiles] = useState([]);
    const [error, setError] = useState("");
    const [menuAnchor, setMenuAnchor] = useState(null);
    const [menuTarget, setMenuTarget] = useState(null);

    const [typeFilter, setTypeFilter] = useState("all");
    const [folderFilter, setFolderFilter] = useState("all");
    const [dateFilter, setDateFilter] = useState("all");

    const load = () => {
        getRecentFiles()
            .then((res) => setFiles(res.data))
            .catch((err) => setError(err.response?.data?.message || "Yüklenemedi"));
    };

    useEffect(() => {
        load();
    }, []);

    const openMenu = (e, file) => {
        setMenuAnchor(e.currentTarget);
        setMenuTarget(file);
    };

    const closeMenu = () => setMenuAnchor(null);

    const handleDelete = async () => {
        if (!menuTarget) return;
        try {
            await deleteFile(menuTarget.id);
            closeMenu();
            load();
        } catch (err) {
            setError(err.response?.data?.message || "Silinemedi");
        }
    };

    const typeOptions = useMemo(() => {
        const categories = new Set(files.map((f) => getFileCategory(f.extension)));
        return [
            { value: "all", label: "Tümü" },
            ...Array.from(categories).map((c) => ({ value: c, label: CATEGORY_LABELS[c] })),
        ];
    }, [files]);

    const folderOptions = useMemo(() => {
        const folders = new Set(files.map((f) => f.folderName));
        return [
            { value: "all", label: "Tümü" },
            ...Array.from(folders).sort().map((f) => ({ value: f, label: f })),
        ];
    }, [files]);

    const dateOptions = [
        { value: "all", label: "Tümü" },
        { value: "today", label: "Bugün" },
        { value: "week", label: "Son 7 gün" },
        { value: "month", label: "Son 30 gün" },
    ];

    const isWithinDateFilter = (accessedAt) => {
        if (dateFilter === "all") return true;
        if (!accessedAt) return false;
        const diffMs = Date.now() - new Date(accessedAt).getTime();
        const dayMs = 24 * 60 * 60 * 1000;
        if (dateFilter === "today") return diffMs < dayMs;
        if (dateFilter === "week") return diffMs < 7 * dayMs;
        if (dateFilter === "month") return diffMs < 30 * dayMs;
        return true;
    };

    const filteredFiles = files.filter((f) =>
        (typeFilter === "all" || getFileCategory(f.extension) === typeFilter) &&
        (folderFilter === "all" || f.folderName === folderFilter) &&
        isWithinDateFilter(f.lastAccessedAt)
    );

    const groups = filteredFiles.reduce((acc, file) => {
        const label = groupLabel(file.lastAccessedAt);
        if (!acc[label]) acc[label] = [];
        acc[label].push(file);
        return acc;
    }, {});

    return (
        <Layout>
            <Typography variant="h4" gutterBottom>Son Erişilenler</Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {files.length > 0 && (
                <Box sx={{ display: "flex", gap: 1.5, mb: 3 }}>
                    <FilterPill label="Tür" value={typeFilter} onChange={setTypeFilter} options={typeOptions} />
                    <FilterPill label="Klasör" value={folderFilter} onChange={setFolderFilter} options={folderOptions} />
                    <FilterPill label="Değiştirilme" value={dateFilter} onChange={setDateFilter} options={dateOptions} />
                </Box>
            )}

            {Object.entries(groups).map(([label, groupFiles]) => (
                <Box key={label} sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
                        {label}
                    </Typography>

                    {groupFiles.map((file) => (
                        <Paper
                            key={file.id}
                            variant="outlined"
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                                p: 1.5,
                                mb: 1,
                            }}
                        >
                            <Box sx={{ fontSize: 28, display: "flex" }}>{getFileIcon(file.extension)}</Box>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="body2" noWrap>{file.name}</Typography>
                                <Typography variant="caption" color="text.secondary" noWrap>
                                    /{file.folderName}/
                                </Typography>
                            </Box>
                            <Typography variant="caption" color="text.secondary" sx={{ minWidth: 60 }}>
                                {(file.size / 1024 / 1024).toFixed(1)} MB
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ minWidth: 90, textAlign: "right" }}>
                                {formatTime(file.lastAccessedAt)}
                            </Typography>
                            <IconButton size="small" onClick={(e) => openMenu(e, file)}>
                                <MoreVertIcon fontSize="small" />
                            </IconButton>
                        </Paper>
                    ))}
                </Box>
            ))}

            {files.length === 0 && (
                <Typography color="text.secondary">Henüz erişim geçmişi yok.</Typography>
            )}
            {files.length > 0 && filteredFiles.length === 0 && (
                <Typography color="text.secondary">Filtreyle eşleşen bir sonuç yok.</Typography>
            )}

            <Menu anchorEl={menuAnchor} open={!!menuAnchor} onClose={closeMenu}>
                <MenuItem onClick={() => { downloadFile(menuTarget.id, menuTarget.name); closeMenu(); }}>
                    <ListItemIcon><DownloadIcon fontSize="small" /></ListItemIcon>
                    İndir
                </MenuItem>
                <MenuItem onClick={handleDelete}>
                    <ListItemIcon><DeleteIcon fontSize="small" /></ListItemIcon>
                    Sil
                </MenuItem>
            </Menu>
        </Layout>
    );
}

export default Recent;