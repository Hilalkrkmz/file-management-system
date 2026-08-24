import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import Paper from "@mui/material/Paper";
import InputAdornment from "@mui/material/InputAdornment";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import CloudDoneOutlinedIcon from "@mui/icons-material/CloudDoneOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import "../styles/Login.css";

const FEATURES = [
    { icon: <CloudDoneOutlinedIcon fontSize="small" />, text: "Dosyalarınıza her yerden erişin" },
    { icon: <ShareOutlinedIcon fontSize="small" />, text: "Tek tıkla kolay paylaşım" },
    { icon: <VerifiedUserOutlinedIcon fontSize="small" />, text: "Güvenli ve özel depolama" },
];

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            await login(email, password);
            navigate("/dashboard");
        } catch (err) {
            setError(err.response?.data?.message || "Giriş başarısız");
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-branding">
                <div className="auth-branding-logo">📁 FileFlow</div>
                <Typography className="auth-branding-tagline">
                    Dosyalarınızı tek bir yerden güvenle saklayın, düzenleyin ve ekibinizle paylaşın.
                </Typography>
                <div className="auth-features">
                    {FEATURES.map((f) => (
                        <div className="auth-feature" key={f.text}>
                            <span className="auth-feature-icon">{f.icon}</span>
                            {f.text}
                        </div>
                    ))}
                </div>
            </div>

            <div className="auth-form-panel">
                <Paper elevation={3} className="auth-container">
                    <div className="auth-mobile-logo">📁 FileFlow</div>
                    <Typography variant="h5" className="auth-title">Tekrar hoş geldin</Typography>
                    <Typography variant="body2" color="text.secondary" className="auth-subtitle">
                        Devam etmek için giriş yap
                    </Typography>
                    {location.state?.registered && (
                        <Alert severity="success" sx={{ mb: 1 }}>Kayıt başarılı, şimdi giriş yapabilirsin.</Alert>
                    )}
                    <form onSubmit={handleSubmit} className="auth-form">
                        <TextField
                            label="Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            fullWidth
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <EmailOutlinedIcon fontSize="small" color="action" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <TextField
                            label="Şifre"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            fullWidth
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LockOutlinedIcon fontSize="small" color="action" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        {error && <Alert severity="error">{error}</Alert>}
                        <Button type="submit" variant="contained" size="large" fullWidth>Giriş Yap</Button>
                    </form>
                    <Typography className="auth-footer">
                        Hesabın yok mu? <Link to="/register">Kayıt Ol</Link>
                    </Typography>
                </Paper>
            </div>
        </div>
    );
}

export default Login;
