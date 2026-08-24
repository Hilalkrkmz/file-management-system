import { useState, useEffect } from "react";
import { getAllUsers, updateUserQuota, adminDeleteUser } from "../api/adminApi";
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
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import TableSortLabel from "@mui/material/TableSortLabel";

function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState("");
    const [quotaTarget, setQuotaTarget] = useState(null);
    const [quotaValue, setQuotaValue] = useState("");
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [orderBy, setOrderBy] = useState("username");
    const [order, setOrder] = useState("asc");

    const loadUsers = () => {
        getAllUsers()
            .then((res) => setUsers(res.data))
            .catch((err) => setError(err.response?.data?.message || "Yüklenemedi"));
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const handleOpenQuota = (user) => {
        setQuotaTarget(user);
        setQuotaValue(String(user.storageQuotaMb));
    };

    const handleConfirmQuota = async () => {
        if (!quotaTarget || !quotaValue) return;
        try {
            await updateUserQuota(quotaTarget.id, Number(quotaValue));
            setQuotaTarget(null);
            loadUsers();
        } catch (err) {
            setError(err.response?.data?.message || "Kota güncellenemedi");
        }
    };

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;
        try {
            await adminDeleteUser(deleteTarget.id);
            setDeleteTarget(null);
            loadUsers();
        } catch (err) {
            setError(err.response?.data?.message || "Silinemedi");
        }
    };

    const handleSort = (field) => {
        const isAsc = orderBy === field && order === "asc";
        setOrder(isAsc ? "desc" : "asc");
        setOrderBy(field);
    };

    const sortedUsers = [...users].sort((a, b) => {
        const aVal = a[orderBy];
        const bVal = b[orderBy];
        if (aVal < bVal) return order === "asc" ? -1 : 1;
        if (aVal > bVal) return order === "asc" ? 1 : -1;
        return 0;
    });

    return (
        <Layout>
            <Typography variant="h4" gutterBottom>Kullanıcılar</Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <TableContainer component={Paper} variant="outlined">
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                <TableSortLabel
                                    active={orderBy === "username"}
                                    direction={orderBy === "username" ? order : "asc"}
                                    onClick={() => handleSort("username")}
                                >
                                    Kullanıcı Adı
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={orderBy === "email"}
                                    direction={orderBy === "email" ? order : "asc"}
                                    onClick={() => handleSort("email")}
                                >
                                    Email
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={orderBy === "role"}
                                    direction={orderBy === "role" ? order : "asc"}
                                    onClick={() => handleSort("role")}
                                >
                                    Rol
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={orderBy === "storageQuotaMb"}
                                    direction={orderBy === "storageQuotaMb" ? order : "asc"}
                                    onClick={() => handleSort("storageQuotaMb")}
                                >
                                    Kota (MB)
                                </TableSortLabel>
                            </TableCell>
                            <TableCell align="right">İşlemler</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sortedUsers.map((u) => (
                            <TableRow key={u.id} hover>
                                <TableCell>{u.username}</TableCell>
                                <TableCell>{u.email}</TableCell>
                                <TableCell>{u.role}</TableCell>
                                <TableCell>{u.storageQuotaMb}</TableCell>
                                <TableCell align="right">
                                    <IconButton size="small" onClick={() => handleOpenQuota(u)}>
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton size="small" color="error" onClick={() => setDeleteTarget(u)}>
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={!!quotaTarget} onClose={() => setQuotaTarget(null)}>
                <DialogTitle>"{quotaTarget?.username}" için kota güncelle</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        fullWidth
                        type="number"
                        label="Kota (MB)"
                        value={quotaValue}
                        onChange={(e) => setQuotaValue(e.target.value)}
                        style={{ marginTop: 8 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setQuotaTarget(null)}>İptal</Button>
                    <Button variant="contained" onClick={handleConfirmQuota}>Kaydet</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
                <DialogTitle>"{deleteTarget?.username}" kullanıcısı silinsin mi? Bu işlem geri alınamaz.</DialogTitle>
                <DialogActions>
                    <Button onClick={() => setDeleteTarget(null)}>İptal</Button>
                    <Button color="error" variant="contained" onClick={handleConfirmDelete}>Sil</Button>
                </DialogActions>
            </Dialog>
        </Layout>
    );
}

export default AdminUsers;