import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
import MuiLink from "@mui/material/Link";
import DeleteIcon from "@mui/icons-material/Delete";
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

    const loadFiles = () => {
        getAllFiles()
            .then((res) => setFiles(res.data))
            .catch((err) => setError(err.response?.data?.message || "Yuklenemedi"));
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

    return (
        <Layout>
            <MuiLink component={Link} to="/admin" sx={{ display: "inline-block", mb: 2 }}>
                ← Admin Paneli
            </MuiLink>
            <Typography variant="h4" gutterBottom>Tum Dosyalar</Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <TableContainer component={Paper} variant="outlined">
                <Table>
                    <TableHead>
                        <TableRow>
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
                            <TableCell align="right">Islem</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sortedFiles.map((f) => (
                            <TableRow key={f.id} hover>
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
                    <Button onClick={() => setDeleteTarget(null)}>Iptal</Button>
                    <Button color="error" variant="contained" onClick={handleConfirmDelete}>Sil</Button>
                </DialogActions>
            </Dialog>
        </Layout>
    );
}

export default AdminFiles;