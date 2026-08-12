import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAllUsers, getAllFiles, adminDeleteFile, updateUserQuota } from "../api/adminApi";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import Alert from "@mui/material/Alert";
import MuiLink from "@mui/material/Link";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import "../styles/SimpleList.css";

function Admin() {
    const [users, setUsers] = useState([]);
    const [files, setFiles] = useState([]);
    const [error, setError] = useState("");

    const loadData = () => {
        getAllUsers().then((res) => setUsers(res.data)).catch((err) => setError(err.response?.data?.message || "Yuklenemedi"));
        getAllFiles().then((res) => setFiles(res.data)).catch((err) => setError(err.response?.data?.message || "Yuklenemedi"));
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleQuotaChange = async (userId) => {
        const newQuota = window.prompt("Yeni kota (MB):");
        if (!newQuota) return;
        try {
            await updateUserQuota(userId, Number(newQuota));
            loadData();
        } catch (err) {
            setError(err.response?.data?.message || "Kota guncellenemedi");
        }
    };

    const handleDeleteFile = async (id) => {
        try {
            await adminDeleteFile(id);
            loadData();
        } catch (err) {
            setError(err.response?.data?.message || "Silinemedi");
        }
    };

    return (
        <div className="page-container">
            <MuiLink component={Link} to="/dashboard" className="page-back-link">
                ← Geri
            </MuiLink>
            <Typography variant="h5" gutterBottom>Admin Paneli</Typography>
            {error && <Alert severity="error">{error}</Alert>}

            <Typography variant="h6">Kullanicilar</Typography>
            <List>
                {users.map((u) => (
                    <ListItem
                        key={u.id}
                        secondaryAction={
                            <IconButton onClick={() => handleQuotaChange(u.id)}>
                                <EditIcon />
                            </IconButton>
                        }
                    >
                        <ListItemText
                            primary={`${u.username} (${u.email})`}
                            secondary={`${u.role} — Kota: ${u.storageQuotaMb}MB`}
                        />
                    </ListItem>
                ))}
            </List>

            <Typography variant="h6">Tum Dosyalar</Typography>
            <List>
                {files.map((f) => (
                    <ListItem
                        key={f.id}
                        secondaryAction={
                            <IconButton onClick={() => handleDeleteFile(f.id)}>
                                <DeleteIcon />
                            </IconButton>
                        }
                    >
                        <ListItemText
                            primary={f.name}
                            secondary={`Sahibi: ${f.ownerUsername} (${(f.size / 1024).toFixed(1)} KB)`}
                        />
                    </ListItem>
                ))}
            </List>
        </div>
    );
}

export default Admin;