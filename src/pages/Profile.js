import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
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

  useEffect(() => {
    const loadProfile = async () => {
      const uid = auth.currentUser.uid;
      const ref = doc(db, "users", uid);
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
    };

    loadProfile();
  }, []);

  const saveProfile = async () => {
    try {
      setSaving(true);

      const uid = auth.currentUser.uid;
      const ref = doc(db, "users", uid);

      await updateDoc(ref, {
        monthlyLimit: Number(monthlyLimit),
        weeklyLimit: Number(weeklyLimit),
        categoryLimits
      });

      navigate("/dashboard");
    } catch (err) {
      alert("Failed to update limits");
      setSaving(false);
    }
  };

  // 🔄 Loading while fetching profile
  if (loading) {
    return <LoadingScreen text="Loading profile..." />;
  }

  // 🔄 Loading while saving limits
  if (saving) {
    return <LoadingScreen text="Updating limits..." />;
  }

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

        <button className="btn" onClick={saveProfile}>
          Save Limits
        </button>
      </div>
    </div>
  );
}
