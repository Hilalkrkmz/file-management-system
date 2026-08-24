import { useState, useEffect } from "react";
import { getFolders } from "../api/folderApi";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import FolderIcon from "@mui/icons-material/Folder";

function MoveDialog({ open, onClose, onConfirm }) {
    const [currentFolderId, setCurrentFolderId] = useState(null);
    const [path, setPath] = useState([{ id: null, name: "Ana Dizin" }]);
    const [folders, setFolders] = useState([]);

    useEffect(() => {
        if (!open) return;
        setCurrentFolderId(null);
        setPath([{ id: null, name: "Ana Dizin" }]);
    }, [open]);

    useEffect(() => {
        if (!open) return;
        getFolders(currentFolderId).then((res) => setFolders(res.data));
    }, [currentFolderId, open]);

    const enterFolder = (folder) => {
        setCurrentFolderId(folder.id);
        setPath([...path, { id: folder.id, name: folder.name }]);
    };

    const goToPathIndex = (index) => {
        setCurrentFolderId(path[index].id);
        setPath(path.slice(0, index + 1));
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle>
                Taşı: {path.map((p) => p.name).join(" / ")}
            </DialogTitle>
            <DialogContent>
                <List>
                    {path.length > 1 && (
                        <ListItemButton onClick={() => goToPathIndex(path.length - 2)}>
                            <ListItemText primary=".. (bir üst dizin)" />
                        </ListItemButton>
                    )}
                    {folders.map((folder) => (
                        <ListItemButton key={folder.id} onClick={() => enterFolder(folder)}>
                            <ListItemIcon><FolderIcon /></ListItemIcon>
                            <ListItemText primary={folder.name} />
                        </ListItemButton>
                    ))}
                    {folders.length === 0 && (
                        <ListItemText primary="Alt klasör yok" sx={{ px: 2, color: "text.secondary" }} />
                    )}
                </List>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>İptal</Button>
                <Button variant="contained" onClick={() => onConfirm(currentFolderId)}>
                    Buraya Taşı
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default MoveDialog;