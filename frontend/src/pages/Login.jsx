import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import Paper from "@mui/material/Paper";
import "../styles/Login.css";
import { useLocation } from "react-router-dom";

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
            setError(err.response?.data?.message || "Giris basarisiz");
        }
    };

    return (
        <Paper elevation={3} className="auth-container">
            <Typography variant="h5" className="auth-title">Giris Yap</Typography>
            {location.state?.registered && (
                <Alert severity="success" sx={{ mb: 1 }}>Kayit basarili, simdi giris yapabilirsin.</Alert>
            )}
            <form onSubmit={handleSubmit} className="auth-container" style={{ margin: 0, padding: 0 }}>
                <TextField
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    fullWidth
                />
                <TextField
                    label="Sifre"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    fullWidth
                />
                {error && <Alert severity="error">{error}</Alert>}
                <Button type="submit" variant="contained" fullWidth>Giris Yap</Button>
            </form>
            <Typography className="auth-footer">
                Hesabin yok mu? <Link to="/register">Kayit Ol</Link>
            </Typography>
        </Paper>
    );
}

export default Login;