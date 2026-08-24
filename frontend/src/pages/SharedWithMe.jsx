import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getSharedWithMe, getFoldersSharedWithMe } from "../api/shareApi";
import { downloadFile } from "../api/fileApi";
import { getFileIcon } from "../utils/fileIcons.jsx";
import Layout from "../components/Layout.jsx";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import IconButton from "@mui/material/IconButton";
import Alert from "@mui/material/Alert";
import DownloadIcon from "@mui/icons-material/Download";
import FolderIcon from "@mui/icons-material/Folder";

function SharedWithMe() {
    const navigate = useNavigate();
    const [shares, setShares] = useState([]);
    const [folderShares, setFolderShares] = useState([]);
    const [error, setError] = useState("");

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

    return (
        <Layout>
            <Typography variant="h4" gutterBottom>Benimle Paylaşılanlar</Typography>
            {error && <Alert severity="error">{error}</Alert>}

            {folderShares.length > 0 && (
                <>
                    <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>Klasörler</Typography>
                    <List sx={{ mb: 2 }}>
                        {folderShares.map((s) => (
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

            {shares.length > 0 && (
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>Dosyalar</Typography>
            )}
            <List>
                {shares.map((s) => (
                    <ListItem
                        key={s.id}
                        secondaryAction={
                            <IconButton onClick={() => downloadFile(s.fileId, s.fileName)}>
                                <DownloadIcon />
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
            {shares.length === 0 && folderShares.length === 0 && (
                <Typography color="text.secondary">Henüz sizinle paylaşılan bir dosya veya klasör yok.</Typography>
            )}
        </Layout>
    );
}

export default SharedWithMe;
