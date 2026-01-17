import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc
} from "firebase/firestore";
import { auth, db } from "../firebase";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";

import Navbar from "../components/Navbar";
import ExpenseChart from "../components/ExpenseChart";
import LoadingScreen from "../components/LoadingScreen";

export default function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [total, setTotal] = useState(0);
  const [weeklyTotal, setWeeklyTotal] = useState(0);
  const [monthlyLimit, setMonthlyLimit] = useState(0);
  const [weeklyLimit, setWeeklyLimit] = useState(0);

  const [categoryMap, setCategoryMap] = useState({});
  const [warnings, setWarnings] = useState([]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) return navigate("/");

      setUser(u);
      setLoading(true);

      const q = query(collection(db, "expenses"), where("uid", "==", u.uid));
      const snap = await getDocs(q);

      let sum = 0;
      let weekSum = 0;
      const catMap = {};
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      snap.forEach((d) => {
        const data = d.data();
        const amount = Number(data.amount || 0);
        sum += amount;

        const date = data.date?.toDate?.() || new Date(data.date);
        if (date >= weekAgo) weekSum += amount;

        const cat = data.category || "Other";
        catMap[cat] = (catMap[cat] || 0) + amount;
      });

      setTotal(sum);
      setWeeklyTotal(weekSum);
      setCategoryMap(catMap);

      const userSnap = await getDoc(doc(db, "users", u.uid));
      const mLimit = userSnap.data()?.monthlyLimit || 0;
      const wLimit = userSnap.data()?.weeklyLimit || 0;

      setMonthlyLimit(mLimit);
      setWeeklyLimit(wLimit);

      const warns = [];
      const check = (spent, limit, label) => {
        if (!limit) return;
        const p = (spent / limit) * 100;
        if (p >= 100) warns.push(`🚨 ${label} limit exceeded`);
        else if (p >= 90) warns.push(`🔥 ${label} crossed 90%`);
        else if (p >= 80) warns.push(`⚠️ ${label} crossed 80%`);
      };

      check(sum, mLimit, "Monthly");
      check(weekSum, wLimit, "Weekly");

      setWarnings(warns);
      setLoading(false);
    });

    return () => unsub();
  }, [navigate]);

  if (loading) return <LoadingScreen text="Loading dashboard..." />;

  return (
    <div className="page">
      <div className="glass dashboard">
        <Navbar user={user} />

        {/* ===== TOP HEADER ===== */}
        <div className="dash-top-row">
          <div>
            <div className="h1">Expense Dashboard</div>
            <div className="sub">Smart limits, alerts & insights</div>
          </div>

          <div className="top-buttons">
            <button className="top-btn add" data-tip="Add a new expense" onClick={() => navigate("/add")}>
              ➕ Add Expense
            </button>
            <button
              className="top-btn settings"
              onClick={() => navigate("/profile")}
            >
              ⚙️ Edit Limits
            </button>
          </div>
        </div>

        {/* ===== SUMMARY ===== */}
        <div className="summary-bar">
          <div>
            <div className="summary-label">This Month</div>
            <div className="summary-value">₹{total}</div>
          </div>
          <div>
            <div className="summary-label">This Week</div>
            <div className="summary-value">₹{weeklyTotal}</div>
          </div>
        </div>

        {/* ===== CARDS ===== */}
        <div className="cards">
          <div
            className="card clickable"
            onClick={() =>
              navigate("/expenses", { state: { filter: "monthly" } })
            }
          >
            <div className="card-icon">📅</div>
            <div className="card-title">Monthly Spent</div>
            <div className="card-value">₹{total}</div>

            {monthlyLimit > 0 && (
              <div className="progress">
                <div
                  className="progress-fill"
                  style={{
                    width: `${Math.min((total / monthlyLimit) * 100, 100)}%`
                  }}
                />
              </div>
            )}
          </div>

          <div
            className="card clickable"
            onClick={() =>
              navigate("/expenses", { state: { filter: "weekly" } })
            }
          >
            <div className="card-icon">📆</div>
            <div className="card-title">Weekly Spent</div>
            <div className="card-value">₹{weeklyTotal}</div>

            {weeklyLimit > 0 && (
              <div className="progress">
                <div
                  className="progress-fill"
                  style={{
                    width: `${Math.min(
                      (weeklyTotal / weeklyLimit) * 100,
                      100
                    )}%`
                  }}
                />
              </div>
            )}
          </div>

          <div className="card-group">
            <div className="card clickable" onClick={() => navigate("/profile")}>
              <div className="card-icon">🎯</div>
              <div className="card-title">Monthly Limit</div>
              <div className="card-value">₹{monthlyLimit}</div>
            </div>

            <div className="card clickable" onClick={() => navigate("/profile")}>
              <div className="card-icon">⚙️</div>
              <div className="card-title">Weekly Limit</div>
              <div className="card-value">₹{weeklyLimit}</div>
            </div>
          </div>
        </div>

        {/* ===== WARNINGS ===== */}
        {warnings.map((w, i) => (
          <div key={i} className="alert">{w}</div>
        ))}

        <ExpenseChart data={categoryMap} />
      </div>
    </div>
  );
}
