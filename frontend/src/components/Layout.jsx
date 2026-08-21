import Box from "@mui/material/Box";
import Sidebar from "./Sidebar.jsx";
import Header from "./Header.jsx";

function Layout({ children, searchValue, onSearchChange, onSearchSubmit, onClearSearch, searchPlaceholder }) {
    return (
        <Box sx={{ display: "flex" }}>
            <Sidebar />
            <Box component="main" sx={{ flexGrow: 1, p: 3, bgcolor: "background.default", minHeight: "100vh" }}>
                <Header
                    searchValue={searchValue}
                    onSearchChange={onSearchChange}
                    onSearchSubmit={onSearchSubmit}
                    onClearSearch={onClearSearch}
                    searchPlaceholder={searchPlaceholder}
                />
                {children}
            </Box>
        </Box>
    );
}

export default Layout;