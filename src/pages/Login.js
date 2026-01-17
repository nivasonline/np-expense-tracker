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
    if (!email || !password) return alert("Fill all fields");

    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (err) {
      alert(err.message);
      setLoading(false);
    }
  };

  if (loading) return <LoadingScreen text="Signing in..." />;

  return (
    <div className="page">
      <div className="glass auth-card" style={{ width: 420 }}>
        <div className="h1">Welcome Back</div>
        <div className="sub">Login to your account</div>

        <label>Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="auth-btn" onClick={login}>
          Login
        </button>

        <div className="sub" style={{ marginTop: 20 }}>
          New user? <Link to="/register">Create Account</Link>
        </div>
      </div>
    </div>
  );
}
