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

function AdminFiles() {
    const [files, setFiles] = useState([]);
    const [error, setError] = useState("");

    const loadFiles = () => {
        getAllFiles()
            .then((res) => setFiles(res.data))
            .catch((err) => setError(err.response?.data?.message || "Yuklenemedi"));
    };

    useEffect(() => {
        loadFiles();
    }, []);

    const handleDelete = async (id) => {
        try {
            await adminDeleteFile(id);
            loadFiles();
        } catch (err) {
            setError(err.response?.data?.message || "Silinemedi");
        }
    };

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
                            <TableCell>Ad</TableCell>
                            <TableCell>Sahibi</TableCell>
                            <TableCell>Boyut</TableCell>
                            <TableCell align="right">Islem</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {files.map((f) => (
                            <TableRow key={f.id} hover>
                                <TableCell>{f.name}</TableCell>
                                <TableCell>{f.ownerUsername}</TableCell>
                                <TableCell>{(f.size / 1024).toFixed(1)} KB</TableCell>
                                <TableCell align="right">
                                    <IconButton size="small" onClick={() => handleDelete(f.id)}>
                                        <DeleteIcon fontSize="small" />
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

export default AdminFiles;