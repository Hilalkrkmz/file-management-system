import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout.jsx";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import PeopleIcon from "@mui/icons-material/People";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";

function Admin() {
    const navigate = useNavigate();

    const sections = [
        {
            title: "Kullanicilar",
            description: "Kayitli kullanicilari goruntule, kota duzenle",
            icon: <PeopleIcon fontSize="large" color="primary" />,
            path: "/admin/users",
        },
        {
            title: "Tum Dosyalar",
            description: "Sistemdeki tum dosyalari goruntule ve yonet",
            icon: <InsertDriveFileIcon fontSize="large" color="primary" />,
            path: "/admin/files",
        },
    ];

    return (
        <Layout>
            <Typography variant="h4" gutterBottom>Admin Paneli</Typography>
            <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap", mt: 2 }}>
                {sections.map((section) => (
                    <Card key={section.path} variant="outlined" sx={{ width: 260 }}>
                        <CardActionArea onClick={() => navigate(section.path)} sx={{ p: 3 }}>
                            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 1.5 }}>
                                {section.icon}
                                <Typography variant="h6">{section.title}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {section.description}
                                </Typography>
                            </Box>
                        </CardActionArea>
                    </Card>
                ))}
            </Box>
        </Layout>
    );
}

export default Admin;