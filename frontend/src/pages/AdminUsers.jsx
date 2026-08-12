import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAllUsers, updateUserQuota } from "../api/adminApi";
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
import EditIcon from "@mui/icons-material/Edit";

function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState("");

    const loadUsers = () => {
        getAllUsers()
            .then((res) => setUsers(res.data))
            .catch((err) => setError(err.response?.data?.message || "Yuklenemedi"));
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const handleQuotaChange = async (userId) => {
        const newQuota = window.prompt("Yeni kota (MB):");
        if (!newQuota) return;
        try {
            await updateUserQuota(userId, Number(newQuota));
            loadUsers();
        } catch (err) {
            setError(err.response?.data?.message || "Kota guncellenemedi");
        }
    };

    return (
        <Layout>
            <MuiLink component={Link} to="/admin" sx={{ display: "inline-block", mb: 2 }}>
                ← Admin Paneli
            </MuiLink>
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
                            <TableCell align="right">Islem</TableCell>
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
                                    <IconButton size="small" onClick={() => handleQuotaChange(u.id)}>
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Layout>
    );
}

export default AdminUsers;