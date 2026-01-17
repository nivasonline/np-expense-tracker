import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import LoadingScreen from "../components/LoadingScreen";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const register = async () => {
    if (!email || !password) return alert("Fill all fields");

    try {
      setLoading(true);
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (e) {
      alert(e.message);
      setLoading(false);
    }
  };

  if (loading) return <LoadingScreen text="Creating account..." />;

  return (
    <div className="page">
      <div className="glass auth-card" style={{ width: 420 }}>
        <div className="h1">Create Account</div>
        <div className="sub">Start tracking expenses</div>

        <label>Email</label>
        <input value={email} onChange={e => setEmail(e.target.value)} />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        <button className="auth-btn" onClick={register}>
          Register
        </button>
      </div>
    </div>
  );
}
