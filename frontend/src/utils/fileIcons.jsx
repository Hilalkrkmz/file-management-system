import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ImageIcon from "@mui/icons-material/Image";
import ArticleIcon from "@mui/icons-material/Article";
import TableChartIcon from "@mui/icons-material/TableChart";
import SlideshowIcon from "@mui/icons-material/Slideshow";
import FolderZipIcon from "@mui/icons-material/FolderZip";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";

export function getFileIcon(extension) {
    const ext = extension?.toLowerCase();

    switch (ext) {
        case "pdf":
            return <PictureAsPdfIcon style={{ color: "#E53935" }} />;
        case "jpg":
        case "jpeg":
        case "png":
            return <ImageIcon style={{ color: "#8E24AA" }} />;
        case "docx":
        case "txt":
            return <ArticleIcon style={{ color: "#1E88E5" }} />;
        case "xlsx":
            return <TableChartIcon style={{ color: "#43A047" }} />;
        case "pptx":
            return <SlideshowIcon style={{ color: "#FB8C00" }} />;
        case "zip":
        case "rar":
            return <FolderZipIcon style={{ color: "#6D4C41" }} />;
        default:
            return <InsertDriveFileIcon color="action" />;
    }
}