import { useState } from "react";
import Box from "@mui/material/Box";
import InputBase from "@mui/material/InputBase";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import Menu from "@mui/material/Menu";
import Typography from "@mui/material/Typography";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import ClearIcon from "@mui/icons-material/Clear";
import "../styles/Header.css";

function Header({ searchValue, onSearchChange, onSearchSubmit, onClearSearch, searchPlaceholder = "Ara..." }) {
    const [notifAnchor, setNotifAnchor] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearchSubmit?.();
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

            <IconButton onClick={(e) => setNotifAnchor(e.currentTarget)}>
                <Badge color="error" variant="dot" overlap="circular">
                    <NotificationsNoneIcon />
                </Badge>
            </IconButton>
            <Menu anchorEl={notifAnchor} open={!!notifAnchor} onClose={() => setNotifAnchor(null)}>
                <Box sx={{ px: 2, py: 1.5, maxWidth: 260 }}>
                    <Typography variant="body2" color="text.secondary">Henuz bildirim yok</Typography>
                </Box>
            </Menu>
        </header>
    );
}

export default Header;
