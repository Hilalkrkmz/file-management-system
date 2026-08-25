import { useState, useEffect } from "react";
import { getAllFiles, adminDeleteFile } from "../api/adminApi";
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
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import Checkbox from "@mui/material/Checkbox";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TableSortLabel from "@mui/material/TableSortLabel";

function AdminFiles() {
    const [files, setFiles] = useState([]);
    const [error, setError] = useState("");
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [orderBy, setOrderBy] = useState("name");
    const [order, setOrder] = useState("asc");
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

    const loadFiles = () => {
        getAllFiles()
            .then((res) => setFiles(res.data))
            .catch((err) => setError(err.response?.data?.message || "Yüklenemedi"));
    };

    useEffect(() => {
        loadFiles();
    }, []);

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;
        try {
            await adminDeleteFile(deleteTarget.id);
            setDeleteTarget(null);
            loadFiles();
        } catch (err) {
            setError(err.response?.data?.message || "Silinemedi");
        }
    };

    const handleSort = (field) => {
        const isAsc = orderBy === field && order === "asc";
        setOrder(isAsc ? "desc" : "asc");
        setOrderBy(field);
    };

    const sortedFiles = [...files].sort((a, b) => {
        const aVal = a[orderBy];
        const bVal = b[orderBy];
        if (aVal < bVal) return order === "asc" ? -1 : 1;
        if (aVal > bVal) return order === "asc" ? 1 : -1;
        return 0;
    });

    const toggleRow = (id) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === sortedFiles.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(sortedFiles.map((f) => f.id)));
        }
    };

    const clearSelection = () => setSelectedIds(new Set());

    const handleBulkDelete = async () => {
        for (const id of selectedIds) {
            try {
                await adminDeleteFile(id);
            } catch (err) {
                // continue deleting remaining files even if one fails
            }
        }
        setBulkDeleteOpen(false);
        clearSelection();
        loadFiles();
    };

    return (
        <Layout>
            <Typography variant="h4" gutterBottom>Tüm Dosyalar</Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {selectedIds.size > 0 && (
                <Paper
                    variant="outlined"
                    sx={{ display: "flex", alignItems: "center", gap: 2, p: 1.5, mb: 2 }}
                >
                    <Typography variant="body2">{selectedIds.size} öğe seçildi</Typography>
                    <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => setBulkDeleteOpen(true)}>
                        Sil
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
                                    checked={sortedFiles.length > 0 && selectedIds.size === sortedFiles.length}
                                    indeterminate={selectedIds.size > 0 && selectedIds.size < sortedFiles.length}
                                    onChange={toggleSelectAll}
                                />
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={orderBy === "name"}
                                    direction={orderBy === "name" ? order : "asc"}
                                    onClick={() => handleSort("name")}
                                >
                                    Ad
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={orderBy === "ownerUsername"}
                                    direction={orderBy === "ownerUsername" ? order : "asc"}
                                    onClick={() => handleSort("ownerUsername")}
                                >
                                    Sahibi
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={orderBy === "size"}
                                    direction={orderBy === "size" ? order : "asc"}
                                    onClick={() => handleSort("size")}
                                >
                                    Boyut
                                </TableSortLabel>
                            </TableCell>
                            <TableCell align="right">İşlem</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sortedFiles.map((f) => (
                            <TableRow key={f.id} hover selected={selectedIds.has(f.id)}>
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        size="small"
                                        checked={selectedIds.has(f.id)}
                                        onChange={() => toggleRow(f.id)}
                                    />
                                </TableCell>
                                <TableCell>{f.name}</TableCell>
                                <TableCell>{f.ownerUsername}</TableCell>
                                <TableCell>{(f.size / 1024).toFixed(1)} KB</TableCell>
                                <TableCell align="right">
                                    <IconButton size="small" onClick={() => setDeleteTarget(f)}>
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
                <DialogTitle>"{deleteTarget?.name}" silinsin mi?</DialogTitle>
                <DialogActions>
                    <Button onClick={() => setDeleteTarget(null)}>İptal</Button>
                    <Button color="error" variant="contained" onClick={handleConfirmDelete}>Sil</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={bulkDeleteOpen} onClose={() => setBulkDeleteOpen(false)}>
                <DialogTitle>{selectedIds.size} dosya silinsin mi?</DialogTitle>
                <DialogActions>
                    <Button onClick={() => setBulkDeleteOpen(false)}>İptal</Button>
                    <Button color="error" variant="contained" onClick={handleBulkDelete}>Sil</Button>
                </DialogActions>
            </Dialog>
        </Layout>
    );
}

export default AdminFiles;