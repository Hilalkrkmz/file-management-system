import { useState, useEffect, useMemo } from "react";
import { getStarredFiles, downloadFile, toggleStar } from "../api/fileApi";
import { getFileIcon } from "../utils/fileIcons.jsx";
import { getFileCategory, CATEGORY_LABELS } from "../utils/fileCategory.js";
import Layout from "../components/Layout.jsx";
import FilterPill from "../components/FilterPill.jsx";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import DownloadIcon from "@mui/icons-material/Download";
import StarIcon from "@mui/icons-material/Star";

function Starred() {
    const [files, setFiles] = useState([]);
    const [error, setError] = useState("");

    const [typeFilter, setTypeFilter] = useState("all");
    const [folderFilter, setFolderFilter] = useState("all");
    const [dateFilter, setDateFilter] = useState("all");

    const load = () => {
        getStarredFiles()
            .then((res) => setFiles(res.data))
            .catch((err) => setError(err.response?.data?.message || "Yüklenemedi"));
    };

    useEffect(() => {
        load();
    }, []);

    const handleUnstar = async (id) => {
        try {
            await toggleStar(id);
            load();
        } catch (err) {
            setError(err.response?.data?.message || "İşlem başarısız");
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

    const isWithinDateFilter = (uploadedAt) => {
        if (dateFilter === "all") return true;
        if (!uploadedAt) return false;
        const diffMs = Date.now() - new Date(uploadedAt).getTime();
        const dayMs = 24 * 60 * 60 * 1000;
        if (dateFilter === "today") return diffMs < dayMs;
        if (dateFilter === "week") return diffMs < 7 * dayMs;
        if (dateFilter === "month") return diffMs < 30 * dayMs;
        return true;
    };

    const filteredFiles = files.filter((f) =>
        (typeFilter === "all" || getFileCategory(f.extension) === typeFilter) &&
        (folderFilter === "all" || (f.folderName) === folderFilter) &&
        isWithinDateFilter(f.uploadedAt)
    );

    return (
        <Layout>
            <Typography variant="h4" gutterBottom>Yıldızlı Dosyalar</Typography>
            {error && <Alert severity="error">{error}</Alert>}

            {files.length > 0 && (
                <Box sx={{ display: "flex", gap: 1.5, mb: 3 }}>
                    <FilterPill label="Tür" value={typeFilter} onChange={setTypeFilter} options={typeOptions} />
                    <FilterPill label="Klasör" value={folderFilter} onChange={setFolderFilter} options={folderOptions} />
                    <FilterPill label="Değiştirilme" value={dateFilter} onChange={setDateFilter} options={dateOptions} />
                </Box>
            )}

            <List>
                {filteredFiles.map((file) => (
                    <ListItem
                        key={file.id}
                        secondaryAction={
                            <>
                                <IconButton onClick={() => downloadFile(file.id, file.name)}>
                                    <DownloadIcon />
                                </IconButton>
                                <IconButton onClick={() => handleUnstar(file.id)} title="Yıldızı kaldır">
                                    <StarIcon sx={{ color: "#FFB400" }} />
                                </IconButton>
                            </>
                        }
                    >
                        <span style={{ marginRight: 8, display: "flex" }}>{getFileIcon(file.extension)}</span>
                        <ListItemText
                            primary={file.name}
                            secondary={`/${file.folderName}/`}
                        />
                    </ListItem>
                ))}
            </List>

            {files.length === 0 && (
                <Typography color="text.secondary">Henüz yıldızlı dosya yok.</Typography>
            )}
            {files.length > 0 && filteredFiles.length === 0 && (
                <Typography color="text.secondary">Filtreyle eşleşen bir sonuç yok.</Typography>
            )}
        </Layout>
    );
}

export default Starred;
