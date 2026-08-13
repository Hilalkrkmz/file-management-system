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
            setError(err.response?.data?.message || "Kayit basarisiz");
        }
    };

    return (
        <Paper elevation={3} className="auth-container">
            <Typography variant="h5" className="auth-title">Kayit Ol</Typography>
            <form onSubmit={handleSubmit} className="auth-container" style={{ margin: 0, padding: 0 }}>
                <TextField
                    label="Kullanici adi"
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
                    label="Sifre"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    fullWidth
                />
                {error && <Alert severity="error">{error}</Alert>}
                <Button type="submit" variant="contained" fullWidth>Kayit Ol</Button>
            </form>
            <Typography className="auth-footer">
                Zaten hesabin var mi? <Link to="/login">Giris Yap</Link>
            </Typography>
        </Paper>
    );
}

export default Register;