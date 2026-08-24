import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import Paper from "@mui/material/Paper";
import "../styles/Login.css";

function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            await register(username, email, password);
            navigate("/login", { state: { registered: true } });
        } catch (err) {
            setError(err.response?.data?.message || "Kayıt başarısız");
        }
    };

    return (
        <Paper elevation={3} className="auth-container">
            <Typography variant="h5" className="auth-title">Kayıt Ol</Typography>
            <form onSubmit={handleSubmit} className="auth-form">
                <TextField
                    label="Kullanıcı adı"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    fullWidth
                />
                <TextField
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    fullWidth
                />
                <TextField
                    label="Şifre"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    fullWidth
                />
                {error && <Alert severity="error">{error}</Alert>}
                <Button type="submit" variant="contained" fullWidth>Kayıt Ol</Button>
            </form>
            <Typography className="auth-footer">
                Zaten hesabın var mı? <Link to="/login">Giriş Yap</Link>
            </Typography>
        </Paper>
    );
}

export default Register;