import { useState, useEffect } from "react";
import { getRecentFiles, downloadFile, deleteFile } from "../api/fileApi";
import { getFileIcon } from "../utils/fileIcons.jsx";
import Layout from "../components/Layout.jsx";
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

    const groups = files.reduce((acc, file) => {
        const label = groupLabel(file.lastAccessedAt);
        if (!acc[label]) acc[label] = [];
        acc[label].push(file);
        return acc;
    }, {});

    return (
        <Layout>
            <Typography variant="h4" gutterBottom>Son Erişilenler</Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

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