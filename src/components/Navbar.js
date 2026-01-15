import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function Navbar({ user }) {
  const navigate = useNavigate();

  const logout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <div className="navbar" style={styles.nav}>
      <div style={styles.logo}>💸 Smart Expense</div>
      <div style={styles.right}>
        <span style={styles.email}>{user?.email}</span>
        <button
  style={styles.btn}
  onClick={() => navigate("/profile")}
>
  Profile
</button>

        <button style={styles.btn} onClick={logout}>Logout</button>
      </div>
    </div>
  );
}

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 28px",
    marginBottom: "30px",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.12)",
    backdropFilter: "blur(18px)"
  },
  logo: { fontWeight: 700, fontSize: "18px" },
  right: { display: "flex", alignItems: "center", gap: "15px" },
  email: { fontSize: "14px", opacity: 0.8 },
  btn: {
    padding: "8px 14px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    background: "linear-gradient(135deg,#ff416c,#ff4b2b)",
    color: "white",
    fontWeight: 600
  }
};
