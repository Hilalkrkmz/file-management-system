import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getFolderTrash, restoreFolder } from "../api/folderApi";
import { getFileTrash, restoreFile } from "../api/fileApi";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import Alert from "@mui/material/Alert";
import MuiLink from "@mui/material/Link";
import RestoreIcon from "@mui/icons-material/Restore";
import FolderIcon from "@mui/icons-material/Folder";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import "../styles/SimpleList.css";

function Trash() {
    const [folders, setFolders] = useState([]);
    const [files, setFiles] = useState([]);
    const [error, setError] = useState("");

    const loadTrash = () => {
        getFolderTrash().then((res) => setFolders(res.data)).catch((err) => setError(err.response?.data?.message || "Yuklenemedi"));
        getFileTrash().then((res) => setFiles(res.data)).catch((err) => setError(err.response?.data?.message || "Yuklenemedi"));
    };

    useEffect(() => {
        loadTrash();
    }, []);

    const handleRestoreFolder = async (id) => {
        try {
            await restoreFolder(id);
            loadTrash();
        } catch (err) {
            setError(err.response?.data?.message || "Geri yuklenemedi");
        }
    };

    const handleRestoreFile = async (id) => {
        try {
            await restoreFile(id);
            loadTrash();
        } catch (err) {
            setError(err.response?.data?.message || "Geri yuklenemedi");
        }
    };

    return (
        <div className="page-container">
            <MuiLink component={Link} to="/dashboard" className="page-back-link">
                ← Geri
            </MuiLink>
            <Typography variant="h5" gutterBottom>Cop Kutusu</Typography>
            {error && <Alert severity="error">{error}</Alert>}

            <Typography variant="h6">Klasorler</Typography>
            <List>
                {folders.map((f) => (
                    <ListItem
                        key={f.id}
                        secondaryAction={
                            <IconButton onClick={() => handleRestoreFolder(f.id)}>
                                <RestoreIcon />
                            </IconButton>
                        }
                    >
                        <FolderIcon style={{ marginRight: 8 }} />
                        <ListItemText primary={f.name} />
                    </ListItem>
                ))}
            </List>

            <Typography variant="h6">Dosyalar</Typography>
            <List>
                {files.map((f) => (
                    <ListItem
                        key={f.id}
                        secondaryAction={
                            <IconButton onClick={() => handleRestoreFile(f.id)}>
                                <RestoreIcon />
                            </IconButton>
                        }
                    >
                        <InsertDriveFileIcon style={{ marginRight: 8 }} />
                        <ListItemText primary={f.name} />
                    </ListItem>
                ))}
            </List>
        </div>
    );
}

export default Trash;