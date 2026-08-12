import { useState, useEffect } from "react";
import { getSharedWithMe } from "../api/shareApi";
import Layout from "../components/Layout.jsx";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Alert from "@mui/material/Alert";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";

function SharedWithMe() {
    const [shares, setShares] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        getSharedWithMe()
            .then((res) => setShares(res.data))
            .catch((err) => setError(err.response?.data?.message || "Yuklenemedi"));
    }, []);

    return (
        <Layout>
            <Typography variant="h4" gutterBottom>Benimle Paylasilanlar</Typography>
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
        </Layout>
    );
}

export default SharedWithMe;