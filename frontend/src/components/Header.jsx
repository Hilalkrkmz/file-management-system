import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import InputBase from "@mui/material/InputBase";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import Menu from "@mui/material/Menu";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import ClearIcon from "@mui/icons-material/Clear";
import { getNotifications, getUnreadNotificationCount, markAllNotificationsRead } from "../api/notificationApi";
import "../styles/Header.css";

function Header({ searchValue, onSearchChange, onSearchSubmit, onClearSearch, searchPlaceholder = "Ara..." }) {
    const navigate = useNavigate();
    const [notifAnchor, setNotifAnchor] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const loadUnreadCount = () => {
        getUnreadNotificationCount().then((res) => setUnreadCount(res.data.count)).catch(() => { });
    };

    useEffect(() => {
        loadUnreadCount();
        const interval = setInterval(loadUnreadCount, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleOpenNotifications = (e) => {
        setNotifAnchor(e.currentTarget);
        getNotifications().then((res) => setNotifications(res.data)).catch(() => { });
        if (unreadCount > 0) {
            markAllNotificationsRead().then(() => setUnreadCount(0)).catch(() => { });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearchSubmit?.();
    };

    const handleNotificationClick = () => {
        setNotifAnchor(null);
        navigate("/shared-with-me");
    };

    return (
        <header className="app-header">
            <form className="app-header-search" onSubmit={handleSubmit}>
                <SearchIcon fontSize="small" className="app-header-search-icon" />
                <InputBase
                    className="app-header-search-input"
                    placeholder={searchPlaceholder}
                    value={searchValue ?? ""}
                    onChange={(e) => onSearchChange?.(e.target.value)}
                />
                {searchValue && (
                    <IconButton size="small" onClick={() => onClearSearch ? onClearSearch() : onSearchChange?.("")}>
                        <ClearIcon fontSize="small" />
                    </IconButton>
                )}
            </form>

            <IconButton onClick={handleOpenNotifications}>
                <Badge color="error" variant="dot" overlap="circular" invisible={unreadCount === 0}>
                    <NotificationsNoneIcon />
                </Badge>
            </IconButton>
            <Menu anchorEl={notifAnchor} open={!!notifAnchor} onClose={() => setNotifAnchor(null)}>
                <Box sx={{ width: 320, maxHeight: 360, overflowY: "auto" }}>
                    {notifications.length === 0 ? (
                        <Typography variant="body2" color="text.secondary" sx={{ px: 2, py: 1.5 }}>
                            Henuz bildirim yok
                        </Typography>
                    ) : (
                        <List dense disablePadding>
                            {notifications.map((n) => (
                                <ListItemButton key={n.id} divider onClick={handleNotificationClick}>
                                    <ListItemText
                                        primary={n.message}
                                        secondary={new Date(n.createdAt).toLocaleString("tr-TR")}
                                        primaryTypographyProps={{ fontWeight: n.read ? 400 : 600 }}
                                    />
                                </ListItemButton>
                            ))}
                        </List>
                    )}
                </Box>
            </Menu>
        </header>
    );
}

export default Header;
