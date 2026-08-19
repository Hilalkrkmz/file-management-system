import { useState, useEffect } from "react";
import { getStarredFiles, downloadFile, toggleStar } from "../api/fileApi";
import { getFileIcon } from "../utils/fileIcons.jsx";
import Layout from "../components/Layout.jsx";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import Alert from "@mui/material/Alert";
import DownloadIcon from "@mui/icons-material/Download";
import StarIcon from "@mui/icons-material/Star";

function Starred() {
    const [files, setFiles] = useState([]);
    const [error, setError] = useState("");

    const load = () => {
        getStarredFiles()
            .then((res) => setFiles(res.data))
            .catch((err) => setError(err.response?.data?.message || "Yuklenemedi"));
    };

    useEffect(() => {
        load();
    }, []);

    const handleUnstar = async (id) => {
        try {
            await toggleStar(id);
            load();
        } catch (err) {
            setError(err.response?.data?.message || "Islem basarisiz");
        }
    };

    return (
        <Layout>
            <Typography variant="h4" gutterBottom>Yildizli Dosyalar</Typography>
            {error && <Alert severity="error">{error}</Alert>}

            <List>
                {files.map((file) => (
                    <ListItem
                        key={file.id}
                        secondaryAction={
                            <>
                                <IconButton onClick={() => downloadFile(file.id, file.name)}>
                                    <DownloadIcon />
                                </IconButton>
                                <IconButton onClick={() => handleUnstar(file.id)} title="Yildizi kaldir">
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
                <Typography color="text.secondary">Henuz yildizli dosya yok.</Typography>
            )}
        </Layout>
    );
}

export default Starred;