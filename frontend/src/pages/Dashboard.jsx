import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

function Dashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div style={{ padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
                <h2>Hosgeldin, {user?.username}</h2>
                <button onClick={handleLogout}>Cikis Yap</button>
            </div>
            <p>Dosya gezgini yakinda burada olacak.</p>
        </div>
    );
}

export default Dashboard;