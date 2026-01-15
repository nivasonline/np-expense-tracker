import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate, Link } from "react-router-dom";
import LoadingScreen from "../components/LoadingScreen";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const login = async () => {
    if (!email || !password) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (err) {
      alert(err.message);
      setLoading(false);
    }
  };

  // ✅ LOADING SCREEN
  if (loading) {
    return <LoadingScreen text="Signing you in..." />;
  }

  // ✅ NORMAL LOGIN UI
  return (
    <div className="page">
      <div className="glass" style={{ width: 420 }}>
        <div className="h1">Welcome Back</div>
        <div className="sub">Login to continue</div>

        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="btn" onClick={login}>
          Login
        </button>

        <div style={{ marginTop: 20, textAlign: "center" }}>
          Don’t have an account?{" "}
          <Link to="/register" style={{ color: "#00c6ff", fontWeight: 600 }}>
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
