import { useState, useEffect } from "react";
import { getFolderTrash, restoreFolder, permanentDeleteFolder } from "../api/folderApi";
import { getFileTrash, restoreFile, permanentDeleteFile } from "../api/fileApi";
import Layout from "../components/Layout.jsx";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import Paper from "@mui/material/Paper";
import TableContainer from "@mui/material/TableContainer";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import Box from "@mui/material/Box";
import SearchIcon from "@mui/icons-material/Search";
import FolderIcon from "@mui/icons-material/Folder";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import RestoreIcon from "@mui/icons-material/Restore";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import "../styles/Trash.css";

function Trash() {
    const [folders, setFolders] = useState([]);
    const [files, setFiles] = useState([]);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [restoreTarget, setRestoreTarget] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const loadTrash = () => {
        getFolderTrash().then((res) => setFolders(res.data)).catch((err) => setError(err.response?.data?.message || "Yuklenemedi"));
        getFileTrash().then((res) => setFiles(res.data)).catch((err) => setError(err.response?.data?.message || "Yuklenemedi"));
    };

    useEffect(() => {
        loadTrash();
    }, []);

    const handleConfirmRestore = async () => {
        if (!restoreTarget) return;
        try {
            if (restoreTarget.type === "Klasor") {
                await restoreFolder(restoreTarget.id);
            } else {
                await restoreFile(restoreTarget.id);
            }
            setRestoreTarget(null);
            loadTrash();
        } catch (err) {
            setError(err.response?.data?.message || "Geri yuklenemedi");
        }
    };

    const handleConfirmPermanentDelete = async () => {
        if (!deleteTarget) return;
        try {
            if (deleteTarget.type === "Klasor") {
                await permanentDeleteFolder(deleteTarget.id);
            } else {
                await permanentDeleteFile(deleteTarget.id);
            }
            setDeleteTarget(null);
            loadTrash();
        } catch (err) {
            setError(err.response?.data?.message || "Kalici olarak silinemedi");
        }
    };

    const combinedRows = [
        ...folders.map((f) => ({ ...f, type: "Klasor" })),
        ...files.map((f) => ({ ...f, type: "Dosya" })),
    ].filter((row) => row.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <Layout>
            <div className="trash-topbar">
                <Typography variant="h4">Cop Kutusu</Typography>
                <TextField
                    size="small"
                    placeholder="Cop kutusunda ara..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon fontSize="small" />
                            </InputAdornment>
                        ),
                    }}
                />
            </div>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <TableContainer component={Paper} variant="outlined">
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Ad</TableCell>
                            <TableCell>Tur</TableCell>
                            <TableCell align="right">Islemler</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {combinedRows.map((row) => (
                            <TableRow key={`${row.type}-${row.id}`} hover>
                                <TableCell>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        {row.type === "Klasor" ? (
                                            <FolderIcon fontSize="small" color="primary" />
                                        ) : (
                                            <InsertDriveFileIcon fontSize="small" color="action" />
                                        )}
                                        {row.name}
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Chip label={row.type} size="small" />
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton size="small" onClick={() => setRestoreTarget(row)} title="Geri Yukle">
                                        <RestoreIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton size="small" onClick={() => setDeleteTarget(row)} title="Kalici Sil" color="error">
                                        <DeleteForeverIcon fontSize="small" />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {combinedRows.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={3} align="center">
                                    <Typography color="text.secondary" sx={{ py: 3 }}>
                                        Cop kutusu bos
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={!!restoreTarget} onClose={() => setRestoreTarget(null)}>
                <DialogTitle>"{restoreTarget?.name}" geri yuklensin mi?</DialogTitle>
                <DialogActions>
                    <Button onClick={() => setRestoreTarget(null)}>Iptal</Button>
                    <Button variant="contained" onClick={handleConfirmRestore}>Geri Yukle</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
                <DialogTitle>"{deleteTarget?.name}" kalici olarak silinsin mi? Bu islem geri alinamaz.</DialogTitle>
                <DialogActions>
                    <Button onClick={() => setDeleteTarget(null)}>Iptal</Button>
                    <Button color="error" variant="contained" onClick={handleConfirmPermanentDelete}>
                        Kalici Sil
                    </Button>
                </DialogActions>
            </Dialog>
        </Layout>
    );
}

export default Trash;