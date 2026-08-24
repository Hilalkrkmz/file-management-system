import { useState, useEffect } from "react";
import { getSharedWithMe } from "../api/shareApi";
import { downloadFile } from "../api/fileApi";
import { getFileIcon } from "../utils/fileIcons.jsx";
import Layout from "../components/Layout.jsx";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import Alert from "@mui/material/Alert";
import DownloadIcon from "@mui/icons-material/Download";

function SharedWithMe() {
    const [shares, setShares] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        getSharedWithMe()
            .then((res) => setShares(res.data))
            .catch((err) => setError(err.response?.data?.message || "Yüklenemedi"));
    }, []);

    return (
        <Layout>
            <Typography variant="h4" gutterBottom>Benimle Paylaşılanlar</Typography>
            {error && <Alert severity="error">{error}</Alert>}
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
                            secondary={`Paylaşan: ${s.sharedByUsername} (${s.permission})`}
                        />
                    </ListItem>
                ))}
            </List>
            {shares.length === 0 && (
                <Typography color="text.secondary">Henüz sizinle paylaşılan bir dosya yok.</Typography>
            )}
        </Layout>
    );
}

export default SharedWithMe;