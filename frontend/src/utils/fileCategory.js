export const CATEGORY_LABELS = {
    pdf: "PDF",
    image: "Görseller",
    document: "Belgeler",
    spreadsheet: "Tablolar",
    presentation: "Sunumlar",
    archive: "Arşivler",
    other: "Diğer",
};

export function getFileCategory(extension) {
    const ext = extension?.toLowerCase();
    if (ext === "pdf") return "pdf";
    if (["jpg", "jpeg", "png"].includes(ext)) return "image";
    if (["docx", "txt"].includes(ext)) return "document";
    if (ext === "xlsx") return "spreadsheet";
    if (ext === "pptx") return "presentation";
    if (["zip", "rar"].includes(ext)) return "archive";
    return "other";
}
