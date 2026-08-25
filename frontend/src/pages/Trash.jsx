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
import Checkbox from "@mui/material/Checkbox";
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
    const [selectedRows, setSelectedRows] = useState(new Set());
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
    const [bulkRestoreOpen, setBulkRestoreOpen] = useState(false);

    const loadTrash = () => {
        getFolderTrash().then((res) => setFolders(res.data)).catch((err) => setError(err.response?.data?.message || "Yüklenemedi"));
        getFileTrash().then((res) => setFiles(res.data)).catch((err) => setError(err.response?.data?.message || "Yüklenemedi"));
    };

    useEffect(() => {
        loadTrash();
    }, []);

    const handleConfirmRestore = async () => {
        if (!restoreTarget) return;
        try {
            if (restoreTarget.type === "Klasör") {
                await restoreFolder(restoreTarget.id);
            } else {
                await restoreFile(restoreTarget.id);
            }
            setRestoreTarget(null);
            loadTrash();
        } catch (err) {
            setError(err.response?.data?.message || "Geri yüklenemedi");
        }
    };

    const handleConfirmPermanentDelete = async () => {
        if (!deleteTarget) return;
        try {
            if (deleteTarget.type === "Klasör") {
                await permanentDeleteFolder(deleteTarget.id);
            } else {
                await permanentDeleteFile(deleteTarget.id);
            }
            setDeleteTarget(null);
            loadTrash();
        } catch (err) {
            setError(err.response?.data?.message || "Kalıcı olarak silinemedi");
        }
    };

    const combinedRows = [
        ...folders.map((f) => ({ ...f, type: "Klasör" })),
        ...files.map((f) => ({ ...f, type: "Dosya" })),
    ].filter((row) => row.name.toLowerCase().includes(search.toLowerCase()));

    const rowKey = (row) => `${row.type}-${row.id}`;

    const toggleRow = (row) => {
        setSelectedRows((prev) => {
            const next = new Set(prev);
            const key = rowKey(row);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (selectedRows.size === combinedRows.length) {
            setSelectedRows(new Set());
        } else {
            setSelectedRows(new Set(combinedRows.map(rowKey)));
        }
    };

    const clearSelection = () => setSelectedRows(new Set());

    const selectedRowObjects = combinedRows.filter((row) => selectedRows.has(rowKey(row)));

    const handleBulkRestore = async () => {
        for (const row of selectedRowObjects) {
            try {
                if (row.type === "Klasör") {
                    await restoreFolder(row.id);
                } else {
                    await restoreFile(row.id);
                }
            } catch (err) {
                // continue restoring remaining items even if one fails
            }
        }
        setBulkRestoreOpen(false);
        clearSelection();
        loadTrash();
    };

    const handleBulkDelete = async () => {
        for (const row of selectedRowObjects) {
            try {
                if (row.type === "Klasör") {
                    await permanentDeleteFolder(row.id);
                } else {
                    await permanentDeleteFile(row.id);
                }
            } catch (err) {
                // continue deleting remaining items even if one fails
            }
        }
        setBulkDeleteOpen(false);
        clearSelection();
        loadTrash();
    };

    return (
        <Layout>
            <div className="trash-topbar">
                <Typography variant="h4">Çöp Kutusu</Typography>
                <TextField
                    size="small"
                    placeholder="Çöp kutusunda ara..."
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

            {selectedRows.size > 0 && (
                <Paper
                    variant="outlined"
                    sx={{ display: "flex", alignItems: "center", gap: 2, p: 1.5, mb: 2 }}
                >
                    <Typography variant="body2">{selectedRows.size} öğe seçildi</Typography>
                    <Button size="small" startIcon={<RestoreIcon />} onClick={() => setBulkRestoreOpen(true)}>
                        Geri Yükle
                    </Button>
                    <Button size="small" color="error" startIcon={<DeleteForeverIcon />} onClick={() => setBulkDeleteOpen(true)}>
                        Kalıcı Sil
                    </Button>
                    <Button size="small" onClick={clearSelection}>Seçimi Kaldır</Button>
                </Paper>
            )}

            <TableContainer component={Paper} variant="outlined">
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell padding="checkbox">
                                <Checkbox
                                    size="small"
                                    checked={combinedRows.length > 0 && selectedRows.size === combinedRows.length}
                                    indeterminate={selectedRows.size > 0 && selectedRows.size < combinedRows.length}
                                    onChange={toggleSelectAll}
                                />
                            </TableCell>
                            <TableCell>Ad</TableCell>
                            <TableCell>Tür</TableCell>
                            <TableCell align="right">İşlemler</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {combinedRows.map((row) => (
                            <TableRow key={rowKey(row)} hover selected={selectedRows.has(rowKey(row))}>
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        size="small"
                                        checked={selectedRows.has(rowKey(row))}
                                        onChange={() => toggleRow(row)}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        {row.type === "Klasör" ? (
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
                                    <IconButton size="small" onClick={() => setRestoreTarget(row)} title="Geri Yükle">
                                        <RestoreIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton size="small" onClick={() => setDeleteTarget(row)} title="Kalıcı Sil" color="error">
                                        <DeleteForeverIcon fontSize="small" />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {combinedRows.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} align="center">
                                    <Typography color="text.secondary" sx={{ py: 3 }}>
                                        Çöp kutusu boş
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={!!restoreTarget} onClose={() => setRestoreTarget(null)}>
                <DialogTitle>"{restoreTarget?.name}" geri yüklensin mi?</DialogTitle>
                <DialogActions>
                    <Button onClick={() => setRestoreTarget(null)}>İptal</Button>
                    <Button variant="contained" onClick={handleConfirmRestore}>Geri Yükle</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
                <DialogTitle>"{deleteTarget?.name}" kalıcı olarak silinsin mi? Bu işlem geri alınamaz.</DialogTitle>
                <DialogActions>
                    <Button onClick={() => setDeleteTarget(null)}>İptal</Button>
                    <Button color="error" variant="contained" onClick={handleConfirmPermanentDelete}>
                        Kalıcı Sil
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={bulkRestoreOpen} onClose={() => setBulkRestoreOpen(false)}>
                <DialogTitle>{selectedRows.size} öğe geri yüklensin mi?</DialogTitle>
                <DialogActions>
                    <Button onClick={() => setBulkRestoreOpen(false)}>İptal</Button>
                    <Button variant="contained" onClick={handleBulkRestore}>Geri Yükle</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={bulkDeleteOpen} onClose={() => setBulkDeleteOpen(false)}>
                <DialogTitle>{selectedRows.size} öğe kalıcı olarak silinsin mi? Bu işlem geri alınamaz.</DialogTitle>
                <DialogActions>
                    <Button onClick={() => setBulkDeleteOpen(false)}>İptal</Button>
                    <Button color="error" variant="contained" onClick={handleBulkDelete}>Kalıcı Sil</Button>
                </DialogActions>
            </Dialog>
        </Layout>
    );
}

export default Trash;