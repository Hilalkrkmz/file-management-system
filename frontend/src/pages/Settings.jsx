import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getMyProfile, uploadProfilePhoto, changePassword, changeEmail, deleteAccount } from "../api/userApi";
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
import Divider from "@mui/material/Divider";
import LockIcon from "@mui/icons-material/Lock";
import EmailIcon from "@mui/icons-material/Email";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import TextField from "@mui/material/TextField";
import Collapse from "@mui/material/Collapse";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";

function Settings() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [photoUrl, setPhotoUrl] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [passwordSectionOpen, setPasswordSectionOpen] = useState(false);

    const [newEmail, setNewEmail] = useState("");
    const [emailPassword, setEmailPassword] = useState("");
    const [emailSectionOpen, setEmailSectionOpen] = useState(false);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deletePassword, setDeletePassword] = useState("");

    const loadProfile = () => {
        getMyProfile().then((res) => {
            setProfile(res.data);
            if (res.data.hasPhoto) {
                axiosInstance
                    .get("/users/me/photo", { responseType: "blob" })
                    .then((photoRes) => setPhotoUrl(URL.createObjectURL(photoRes.data)))
                    .catch(() => { });
            }
        }).catch((err) => setError(err.response?.data?.message || "Yüklenemedi"));
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
            setSuccess("Profil fotoğrafı güncellendi");
            loadProfile();
        } catch (err) {
            setError(err.response?.data?.message || "Yüklenemedi");
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
            setSuccess("Şifre başarıyla değiştirildi");
            setCurrentPassword("");
            setNewPassword("");
            setPasswordSectionOpen(false);
        } catch (err) {
            setError(err.response?.data?.message || "Şifre değiştirilemedi");
        }
    };

    const handleChangeEmail = async () => {
        setError("");
        setSuccess("");
        try {
            await changeEmail(newEmail, emailPassword);
            setSuccess("Email başarıyla değiştirildi");
            setNewEmail("");
            setEmailPassword("");
            setEmailSectionOpen(false);
            loadProfile();
        } catch (err) {
            setError(err.response?.data?.message || "Email değiştirilemedi");
        }
    };

    const handleDeleteAccount = async () => {
        setError("");
        try {
            await deleteAccount(deletePassword);
            logout();
            navigate("/login");
        } catch (err) {
            setError(err.response?.data?.message || "Hesap silinemedi");
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
                    Çıkış Yap
                </Button>
                <Divider sx={{ my: 3 }} />

                <Button
                    onClick={() => setPasswordSectionOpen((open) => !open)}
                    endIcon={passwordSectionOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    sx={{ mb: 1 }}
                >
                    Şifre Değiştir
                </Button>
                <Collapse in={passwordSectionOpen}>
                    <TextField
                        fullWidth
                        size="small"
                        type="password"
                        label="Mevcut şifre"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        sx={{ mb: 1 }}
                    />
                    <TextField
                        fullWidth
                        size="small"
                        type="password"
                        label="Yeni şifre"
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
                        Şifreyi Güncelle
                    </Button>
                </Collapse>

                <Button
                    onClick={() => setEmailSectionOpen((open) => !open)}
                    endIcon={emailSectionOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    sx={{ mb: 1 }}
                >
                    Email Değiştir
                </Button>
                <Collapse in={emailSectionOpen}>
                    <TextField
                        fullWidth
                        size="small"
                        type="email"
                        label="Yeni email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        sx={{ mb: 1 }}
                    />
                    <TextField
                        fullWidth
                        size="small"
                        type="password"
                        label="Mevcut şifre"
                        value={emailPassword}
                        onChange={(e) => setEmailPassword(e.target.value)}
                        sx={{ mb: 1 }}
                    />
                    <Button
                        variant="outlined"
                        startIcon={<EmailIcon />}
                        onClick={handleChangeEmail}
                        disabled={!newEmail || !emailPassword}
                        sx={{ mb: 3 }}
                    >
                        Emaili Güncelle
                    </Button>
                </Collapse>

                <Divider sx={{ my: 3 }} />

                <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteForeverIcon />}
                    onClick={() => setDeleteDialogOpen(true)}
                >
                    Hesabı Sil
                </Button>
            </Paper>

            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Hesabınızı silmek istediğinize emin misiniz?</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Tüm dosyalarınız, klasörleriniz ve paylaşımlarınız kalıcı olarak silinecek. Bu işlem geri alınamaz.
                    </Typography>
                    <TextField
                        autoFocus
                        fullWidth
                        size="small"
                        type="password"
                        label="Şifrenizi girin"
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>İptal</Button>
                    <Button color="error" variant="contained" onClick={handleDeleteAccount} disabled={!deletePassword}>
                        Hesabı Kalıcı Olarak Sil
                    </Button>
                </DialogActions>
            </Dialog>
        </Layout>
    );
}

export default Settings;
