import { useState, useEffect } from "react";
import { getFolderTrash, restoreFolder } from "../api/folderApi";
import { getFileTrash, restoreFile } from "../api/fileApi";
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
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import FolderIcon from "@mui/icons-material/Folder";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import RestoreIcon from "@mui/icons-material/Restore";
import Box from "@mui/material/Box";

function Trash() {
    const [folders, setFolders] = useState([]);
    const [files, setFiles] = useState([]);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    const loadTrash = () => {
        getFolderTrash().then((res) => setFolders(res.data)).catch((err) => setError(err.response?.data?.message || "Yuklenemedi"));
        getFileTrash().then((res) => setFiles(res.data)).catch((err) => setError(err.response?.data?.message || "Yuklenemedi"));
    };

    useEffect(() => {
        loadTrash();
    }, []);

    const handleRestoreFolder = async (id) => {
        try {
            await restoreFolder(id);
            loadTrash();
        } catch (err) {
            setError(err.response?.data?.message || "Geri yuklenemedi");
        }
    };

    const handleRestoreFile = async (id) => {
        try {
            await restoreFile(id);
            loadTrash();
        } catch (err) {
            setError(err.response?.data?.message || "Geri yuklenemedi");
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
                            <TableCell padding="checkbox">
                                <Checkbox disabled />
                            </TableCell>
                            <TableCell>Ad</TableCell>
                            <TableCell>Tur</TableCell>
                            <TableCell align="right">Islem</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {combinedRows.map((row) => (
                            <TableRow key={`${row.type}-${row.id}`} hover>
                                <TableCell padding="checkbox">
                                    <Checkbox />
                                </TableCell>
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
                                    <Button
                                        size="small"
                                        startIcon={<RestoreIcon />}
                                        onClick={() =>
                                            row.type === "Klasor"
                                                ? handleRestoreFolder(row.id)
                                                : handleRestoreFile(row.id)
                                        }
                                    >
                                        Geri Yukle
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {combinedRows.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} align="center">
                                    <Typography color="text.secondary" sx={{ py: 3 }}>
                                        Cop kutusu bos
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Layout>
    );
}

export default Trash;