import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Layout from "../components/Layout.jsx";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import LogoutIcon from "@mui/icons-material/Logout";

function Settings() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <Layout>
            <Typography variant="h4" gutterBottom>Ayarlar</Typography>

            <Paper variant="outlined" sx={{ p: 3, maxWidth: 400 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                    <Avatar sx={{ width: 56, height: 56 }}>
                        {user?.username?.[0]?.toUpperCase()}
                    </Avatar>
                    <div>
                        <Typography variant="h6">{user?.username}</Typography>
                        <Typography variant="body2" color="text.secondary">{user?.role}</Typography>
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
            </Paper>
        </Layout>
    );
}

export default Settings;