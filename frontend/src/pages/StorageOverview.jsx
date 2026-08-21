import { useState, useEffect } from "react";
import { getStorageUsage } from "../api/fileApi";
import Layout from "../components/Layout.jsx";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import LinearProgress from "@mui/material/LinearProgress";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import StorageIcon from "@mui/icons-material/Storage";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import DonutLargeIcon from "@mui/icons-material/DonutLarge";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

function StorageOverview() {
    const [storage, setStorage] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        getStorageUsage()
            .then((res) => setStorage(res.data))
            .catch((err) => setError(err.response?.data?.message || "Yuklenemedi"));
    }, []);

    if (error) {
        return (
            <Layout>
                <Alert severity="error">{error}</Alert>
            </Layout>
        );
    }

    if (!storage) {
        return (
            <Layout>
                <Typography>Yukleniyor...</Typography>
            </Layout>
        );
    }

    const usagePercent = Math.min((storage.usedMb / storage.quotaMb) * 100, 100);
    const remainingMb = storage.quotaMb - storage.usedMb;

    return (
        <Layout>
            <Typography variant="h4" gutterBottom>Depolama Kullanimi</Typography>

            <Paper variant="outlined" sx={{ p: 3, maxWidth: 500, mb: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <StorageIcon color="primary" />
                    <Typography variant="h6">
                        {storage.usedMb.toFixed(1)} MB / {storage.quotaMb} MB kullanildi
                    </Typography>
                </Box>
                <LinearProgress
                    variant="determinate"
                    value={usagePercent}
                    sx={{ height: 10, borderRadius: 1 }}
                    color={usagePercent > 90 ? "error" : "primary"}
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    %{usagePercent.toFixed(1)} kullanildi
                </Typography>
            </Paper>

            <Grid container spacing={2} sx={{ maxWidth: 700 }}>
                <Grid item xs={4}>
                    <Paper variant="outlined" sx={{ p: 2, textAlign: "center" }}>
                        <InsertDriveFileIcon color="action" />
                        <Typography variant="h6">{storage.fileCount}</Typography>
                        <Typography variant="body2" color="text.secondary">Dosya sayisi</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={4}>
                    <Paper variant="outlined" sx={{ p: 2, textAlign: "center" }}>
                        <DonutLargeIcon color="action" />
                        <Typography variant="h6">{storage.usedMb.toFixed(1)} MB</Typography>
                        <Typography variant="body2" color="text.secondary">Kullanilan</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={4}>
                    <Paper variant="outlined" sx={{ p: 2, textAlign: "center" }}>
                        <CheckCircleOutlineIcon color="action" />
                        <Typography variant="h6">{remainingMb.toFixed(1)} MB</Typography>
                        <Typography variant="body2" color="text.secondary">Kalan</Typography>
                    </Paper>
                </Grid>
            </Grid>
        </Layout>
    );
}

export default StorageOverview;