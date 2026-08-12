import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getSharedWithMe } from "../api/shareApi";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Alert from "@mui/material/Alert";
import MuiLink from "@mui/material/Link";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import "../styles/SimpleList.css";

function SharedWithMe() {
    const [shares, setShares] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        getSharedWithMe()
            .then((res) => setShares(res.data))
            .catch((err) => setError(err.response?.data?.message || "Yuklenemedi"));
    }, []);

    return (
        <div className="page-container">
            <MuiLink component={Link} to="/dashboard" className="page-back-link">
                ← Geri
            </MuiLink>
            <Typography variant="h5" gutterBottom>Benimle Paylasilanlar</Typography>
            {error && <Alert severity="error">{error}</Alert>}
            <List>
                {shares.map((s) => (
                    <ListItem key={s.id}>
                        <InsertDriveFileIcon style={{ marginRight: 8 }} />
                        <ListItemText
                            primary={s.fileName}
                            secondary={`Paylasan: ${s.sharedByUsername} (${s.permission})`}
                        />
                    </ListItem>
                ))}
            </List>
        </div>
    );
}

export default SharedWithMe;