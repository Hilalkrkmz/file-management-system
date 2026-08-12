import Box from "@mui/material/Box";
import Sidebar from "./Sidebar.jsx";

function Layout({ children }) {
    return (
        <Box sx={{ display: "flex" }}>
            <Sidebar />
            <Box component="main" sx={{ flexGrow: 1, p: 3, bgcolor: "background.default", minHeight: "100vh" }}>
                {children}
            </Box>
        </Box>
    );
}

export default Layout;