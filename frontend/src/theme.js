import { createTheme } from "@mui/material/styles";

const theme = createTheme({
    palette: {
        primary: {
            main: "#1B2A4A",
        },
        secondary: {
            main: "#3B82F6",
        },
        background: {
            default: "#F5F6FA",
            paper: "#FFFFFF",
        },
    },
    typography: {
        fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
    },
    shape: {
        borderRadius: 10,
    },
});

export default theme;