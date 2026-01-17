import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import LoadingScreen from "../components/LoadingScreen";

const categories = [
  "Food",
  "Health",
  "Travel",
  "Entertainment",
  "Bills",
  "Shopping",
  "Other"
];

export default function Profile() {
  const navigate = useNavigate();

  const [monthlyLimit, setMonthlyLimit] = useState("");
  const [weeklyLimit, setWeeklyLimit] = useState("");
  const [categoryLimits, setCategoryLimits] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ✅ LOAD PROFILE SAFELY
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/");
        return;
      }

      try {
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          const defaults = {};
          categories.forEach((c) => (defaults[c] = 1000));

          await setDoc(ref, {
            monthlyLimit: 10000,
            weeklyLimit: 2500,
            categoryLimits: defaults
          });

          setMonthlyLimit(10000);
          setWeeklyLimit(2500);
          setCategoryLimits(defaults);
        } else {
          const data = snap.data();
          setMonthlyLimit(data.monthlyLimit || "");
          setWeeklyLimit(data.weeklyLimit || "");
          setCategoryLimits(data.categoryLimits || {});
        }

        setLoading(false);
      } catch (err) {
        console.error("Profile load error:", err);
        alert("Failed to load profile");
        setLoading(false);
      }
    });

    return () => unsub();
  }, [navigate]);

  // ✅ SAVE PROFILE
  const saveProfile = async () => {
    try {
      setSaving(true);

      const user = auth.currentUser;
      if (!user) {
        navigate("/");
        return;
      }

      const ref = doc(db, "users", user.uid);

      await updateDoc(ref, {
        monthlyLimit: Number(monthlyLimit),
        weeklyLimit: Number(weeklyLimit),
        categoryLimits
      });

      navigate("/dashboard");
    } catch (err) {
      console.error("Save error:", err);
      alert("Failed to update limits");
      setSaving(false);
    }
  };

  if (loading) return <LoadingScreen text="Loading profile..." />;
  if (saving) return <LoadingScreen text="Saving limits..." />;

  return (
    <div className="page">
      <div className="glass" style={{ width: 520 }}>
        <div className="h1">⚙️ Budget Settings</div>
        <div className="sub">Set your spending limits</div>

        <label>Total Monthly Limit</label>
        <input
          type="number"
          value={monthlyLimit}
          onChange={(e) => setMonthlyLimit(e.target.value)}
        />

        <label>Total Weekly Limit</label>
        <input
          type="number"
          value={weeklyLimit}
          onChange={(e) => setWeeklyLimit(e.target.value)}
        />

        <hr style={{ margin: "25px 0", opacity: 0.3 }} />

        <div className="sub">Category-wise Monthly Limits</div>

        {categories.map((cat) => (
          <div key={cat}>
            <label>{cat}</label>
            <input
              type="number"
              value={categoryLimits[cat] || ""}
              onChange={(e) =>
                setCategoryLimits({
                  ...categoryLimits,
                  [cat]: Number(e.target.value)
                })
              }
            />
          </div>
        ))}

        <button className="auth-btn" onClick={saveProfile}>
          💾 Save Limits
        </button>
      </div>
    </div>
  );
}
