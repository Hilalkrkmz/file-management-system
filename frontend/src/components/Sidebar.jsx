import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import Avatar from "@mui/material/Avatar";
import FolderIcon from "@mui/icons-material/Folder";
import PeopleIcon from "@mui/icons-material/People";
import DeleteIcon from "@mui/icons-material/Delete";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import LogoutIcon from "@mui/icons-material/Logout";
import "../styles/Sidebar.css";

const DRAWER_WIDTH = 240;

function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();

    const menuItems = [
        { label: "Dosyalarim", icon: <FolderIcon />, path: "/dashboard" },
        { label: "Benimle Paylasilanlar", icon: <PeopleIcon />, path: "/shared-with-me" },
        { label: "Cop Kutusu", icon: <DeleteIcon />, path: "/trash" },
    ];

    if (user?.role === "ADMIN") {
        menuItems.push({ label: "Admin Paneli", icon: <AdminPanelSettingsIcon />, path: "/admin" });
    }

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: DRAWER_WIDTH,
                flexShrink: 0,
                "& .MuiDrawer-paper": { width: DRAWER_WIDTH, boxSizing: "border-box" },
            }}
        >
            <Box className="sidebar-logo">
                <Typography variant="h6" fontWeight="bold">
                    📁 FileFlow
                </Typography>
            </Box>

            <List>
                {menuItems.map((item) => (
                    <ListItemButton
                        key={item.path}
                        selected={location.pathname === item.path}
                        onClick={() => navigate(item.path)}
                    >
                        <ListItemIcon>{item.icon}</ListItemIcon>
                        <ListItemText primary={item.label} />
                    </ListItemButton>
                ))}
            </List>

            <Box className="sidebar-footer">
                <ListItemButton onClick={handleLogout}>
                    <ListItemIcon><LogoutIcon /></ListItemIcon>
                    <ListItemText primary="Cikis Yap" />
                </ListItemButton>

                <Box className="sidebar-profile">
                    <Avatar sx={{ width: 32, height: 32 }}>
                        {user?.username?.[0]?.toUpperCase()}
                    </Avatar>
                    <Typography variant="body2">{user?.username}</Typography>
                </Box>
            </Box>
        </Drawer>
    );
}

export default Sidebar;