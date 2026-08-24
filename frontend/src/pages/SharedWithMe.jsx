import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getSharedWithMe, getFoldersSharedWithMe } from "../api/shareApi";
import { downloadFile, toggleStar } from "../api/fileApi";
import { getFileIcon } from "../utils/fileIcons.jsx";
import Layout from "../components/Layout.jsx";
import FilterPill from "../components/FilterPill.jsx";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import IconButton from "@mui/material/IconButton";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import DownloadIcon from "@mui/icons-material/Download";
import FolderIcon from "@mui/icons-material/Folder";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";

function SharedWithMe() {
    const navigate = useNavigate();
    const [shares, setShares] = useState([]);
    const [folderShares, setFolderShares] = useState([]);
    const [error, setError] = useState("");

    const [typeFilter, setTypeFilter] = useState("all");
    const [userFilter, setUserFilter] = useState("all");
    const [dateFilter, setDateFilter] = useState("all");

    const [menuAnchor, setMenuAnchor] = useState(null);
    const [menuTarget, setMenuTarget] = useState(null);

    useEffect(() => {
        getSharedWithMe()
            .then((res) => setShares(res.data))
            .catch((err) => setError(err.response?.data?.message || "Yüklenemedi"));
        getFoldersSharedWithMe()
            .then((res) => setFolderShares(res.data))
            .catch((err) => setError(err.response?.data?.message || "Yüklenemedi"));
    }, []);

    const handleOpenFolder = (folderShare) => {
        navigate(`/dashboard/shared/${folderShare.folderId}`, {
            state: { folderName: folderShare.folderName },
        });
    };

    const openMenu = (e, share) => {
        setMenuAnchor(e.currentTarget);
        setMenuTarget(share);
    };

    const closeMenu = () => setMenuAnchor(null);

    const handleToggleStar = async () => {
        if (!menuTarget) return;
        try {
            await toggleStar(menuTarget.fileId);
            setShares((prev) => prev.map((s) => (s.id === menuTarget.id ? { ...s, starred: !s.starred } : s)));
        } catch (err) {
            setError(err.response?.data?.message || "İşlem başarısız");
        }
        closeMenu();
    };

    const userOptions = useMemo(() => {
        const usernames = new Set([
            ...folderShares.map((s) => s.sharedByUsername),
            ...shares.map((s) => s.sharedByUsername),
        ]);
        return [
            { value: "all", label: "Tümü" },
            ...Array.from(usernames).sort().map((u) => ({ value: u, label: u })),
        ];
    }, [folderShares, shares]);

    const typeOptions = [
        { value: "all", label: "Tümü" },
        { value: "folder", label: "Klasörler" },
        { value: "file", label: "Dosyalar" },
    ];

    const dateOptions = [
        { value: "all", label: "Tümü" },
        { value: "today", label: "Bugün" },
        { value: "week", label: "Son 7 gün" },
        { value: "month", label: "Son 30 gün" },
    ];

    const isWithinDateFilter = (createdAt) => {
        if (dateFilter === "all") return true;
        if (!createdAt) return false;
        const diffMs = Date.now() - new Date(createdAt).getTime();
        const dayMs = 24 * 60 * 60 * 1000;
        if (dateFilter === "today") return diffMs < dayMs;
        if (dateFilter === "week") return diffMs < 7 * dayMs;
        if (dateFilter === "month") return diffMs < 30 * dayMs;
        return true;
    };

    const matchesFilters = (s) =>
        (userFilter === "all" || s.sharedByUsername === userFilter) && isWithinDateFilter(s.createdAt);

    const filteredFolderShares = typeFilter === "file" ? [] : folderShares.filter(matchesFilters);
    const filteredFileShares = typeFilter === "folder" ? [] : shares.filter(matchesFilters);

    return (
        <Layout>
            <Typography variant="h4" gutterBottom>Benimle Paylaşılanlar</Typography>
            {error && <Alert severity="error">{error}</Alert>}

            <Box sx={{ display: "flex", gap: 1.5, mb: 3 }}>
                <FilterPill label="Tür" value={typeFilter} onChange={setTypeFilter} options={typeOptions} />
                <FilterPill label="Kullanıcılar" value={userFilter} onChange={setUserFilter} options={userOptions} />
                <FilterPill label="Değiştirilme" value={dateFilter} onChange={setDateFilter} options={dateOptions} />
            </Box>

            {filteredFolderShares.length > 0 && (
                <>
                    <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>Klasörler</Typography>
                    <List sx={{ mb: 2 }}>
                        {filteredFolderShares.map((s) => (
                            <ListItemButton key={s.id} onClick={() => handleOpenFolder(s)}>
                                <ListItemIcon><FolderIcon color="primary" /></ListItemIcon>
                                <ListItemText
                                    primary={s.folderName}
                                    secondary={`Paylaşan: ${s.sharedByUsername}`}
                                />
                            </ListItemButton>
                        ))}
                    </List>
                </>
            )}

            {filteredFileShares.length > 0 && (
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>Dosyalar</Typography>
            )}
            <List>
                {filteredFileShares.map((s) => (
                    <ListItem
                        key={s.id}
                        secondaryAction={
                            <IconButton onClick={(e) => openMenu(e, s)}>
                                <MoreVertIcon />
                            </IconButton>
                        }
                    >
                        <span style={{ marginRight: 8, display: "flex" }}>{getFileIcon(s.fileName?.split(".").pop())}</span>
                        <ListItemText
                            primary={s.fileName}
                            secondary={`Paylaşan: ${s.sharedByUsername}`}
                        />
                    </ListItem>
                ))}
            </List>
            {filteredFileShares.length === 0 && filteredFolderShares.length === 0 && (
                <Typography color="text.secondary">
                    {shares.length === 0 && folderShares.length === 0
                        ? "Henüz sizinle paylaşılan bir dosya veya klasör yok."
                        : "Filtreyle eşleşen bir sonuç yok."}
                </Typography>
            )}

            <Menu anchorEl={menuAnchor} open={!!menuAnchor} onClose={closeMenu}>
                <MenuItem onClick={() => { downloadFile(menuTarget.fileId, menuTarget.fileName); closeMenu(); }}>
                    <ListItemIcon><DownloadIcon fontSize="small" /></ListItemIcon>
                    İndir
                </MenuItem>
                <MenuItem onClick={handleToggleStar}>
                    <ListItemIcon>
                        {menuTarget?.starred ? <StarIcon fontSize="small" sx={{ color: "#FFB400" }} /> : <StarBorderIcon fontSize="small" />}
                    </ListItemIcon>
                    {menuTarget?.starred ? "Yıldızı Kaldır" : "Yıldızla"}
                </MenuItem>
            </Menu>
        </Layout>
    );
}

export default SharedWithMe;
