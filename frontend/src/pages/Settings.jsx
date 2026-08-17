import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getMyProfile, uploadProfilePhoto } from "../api/userApi";
import axiosInstance from "../api/axiosInstance";
import Layout from "../components/Layout.jsx";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import LogoutIcon from "@mui/icons-material/Logout";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import { changePassword } from "../api/userApi";
import Divider from "@mui/material/Divider";
import LockIcon from "@mui/icons-material/Lock";
import TextField from "@mui/material/TextField";

function Settings() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [photoUrl, setPhotoUrl] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");

    const loadProfile = () => {
        getMyProfile().then((res) => {
            setProfile(res.data);
            if (res.data.hasPhoto) {
                axiosInstance
                    .get("/users/me/photo", { responseType: "blob" })
                    .then((photoRes) => setPhotoUrl(URL.createObjectURL(photoRes.data)))
                    .catch(() => { });
            }
        }).catch((err) => setError(err.response?.data?.message || "Yuklenemedi"));
    };

    useEffect(() => {
        loadProfile();
    }, []);

    const handlePhotoChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setError("");
        setSuccess("");
        try {
            await uploadProfilePhoto(file);
            setSuccess("Profil fotografi guncellendi");
            loadProfile();
        } catch (err) {
            setError(err.response?.data?.message || "Yuklenemedi");
        }
        e.target.value = "";
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const handleChangePassword = async () => {
        setError("");
        setSuccess("");
        try {
            await changePassword(currentPassword, newPassword);
            setSuccess("Sifre basariyla degistirildi");
            setCurrentPassword("");
            setNewPassword("");
        } catch (err) {
            setError(err.response?.data?.message || "Sifre degistirilemedi");
        }
    };

    return (
        <Layout>
            <Typography variant="h4" gutterBottom>Ayarlar</Typography>

            <Paper variant="outlined" sx={{ p: 3, maxWidth: 400 }}>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                    <Box sx={{ position: "relative" }}>
                        <Avatar sx={{ width: 64, height: 64 }} src={photoUrl}>
                            {user?.username?.[0]?.toUpperCase()}
                        </Avatar>
                        <label htmlFor="photo-input">
                            <input
                                id="photo-input"
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoChange}
                                style={{ display: "none" }}
                            />
                            <Box
                                component="span"
                                sx={{
                                    position: "absolute",
                                    bottom: -4,
                                    right: -4,
                                    bgcolor: "background.paper",
                                    border: "1px solid",
                                    borderColor: "divider",
                                    borderRadius: "50%",
                                    p: 0.5,
                                    cursor: "pointer",
                                    display: "flex",
                                }}
                            >
                                <PhotoCameraIcon fontSize="small" />
                            </Box>
                        </label>
                    </Box>
                    <div>
                        <Typography variant="h6">{profile?.username || user?.username}</Typography>
                        <Typography variant="body2" color="text.secondary">{profile?.email}</Typography>
                        <Typography variant="body2" color="text.secondary">{profile?.role}</Typography>
                    </div>
                </Box>

                <Button
                    variant="outlined"
                    color="error"
                    startIcon={<LogoutIcon />}
                    onClick={handleLogout}
                >
                    Cikis Yap
                </Button>
                <Divider sx={{ my: 3 }} />

                <Typography variant="subtitle2" sx={{ mb: 1 }}>Sifre Degistir</Typography>
                <TextField
                    fullWidth
                    size="small"
                    type="password"
                    label="Mevcut sifre"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    sx={{ mb: 1 }}
                />
                <TextField
                    fullWidth
                    size="small"
                    type="password"
                    label="Yeni sifre"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    sx={{ mb: 1 }}
                />
                <Button
                    variant="outlined"
                    startIcon={<LockIcon />}
                    onClick={handleChangePassword}
                    disabled={!currentPassword || !newPassword}
                    sx={{ mb: 3 }}
                >
                    Sifreyi Guncelle
                </Button>
            </Paper>
        </Layout>
    );
}

export default Settings;