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

function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState("");
    const [quotaTarget, setQuotaTarget] = useState(null);
    const [quotaValue, setQuotaValue] = useState("");
    const [deleteTarget, setDeleteTarget] = useState(null);

    const loadUsers = () => {
        getAllUsers()
            .then((res) => setUsers(res.data))
            .catch((err) => setError(err.response?.data?.message || "Yuklenemedi"));
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
            setError(err.response?.data?.message || "Kota guncellenemedi");
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

    return (
        <Layout>
            <Typography variant="h4" gutterBottom>Kullanicilar</Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <TableContainer component={Paper} variant="outlined">
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Kullanici Adi</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Rol</TableCell>
                            <TableCell>Kota (MB)</TableCell>
                            <TableCell align="right">Islemler</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((u) => (
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
                <DialogTitle>"{quotaTarget?.username}" icin kota guncelle</DialogTitle>
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
                    <Button onClick={() => setQuotaTarget(null)}>Iptal</Button>
                    <Button variant="contained" onClick={handleConfirmQuota}>Kaydet</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
                <DialogTitle>"{deleteTarget?.username}" kullanicisi silinsin mi? Bu islem geri alinamaz.</DialogTitle>
                <DialogActions>
                    <Button onClick={() => setDeleteTarget(null)}>Iptal</Button>
                    <Button color="error" variant="contained" onClick={handleConfirmDelete}>Sil</Button>
                </DialogActions>
            </Dialog>
        </Layout>
    );
}

export default AdminUsers;