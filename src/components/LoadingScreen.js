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
import { Link, useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";

import Navbar from "../components/Navbar";
import ExpenseChart from "../components/ExpenseChart";

export default function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [total, setTotal] = useState(0);
  const [weeklyTotal, setWeeklyTotal] = useState(0);

  const [monthlyLimit, setMonthlyLimit] = useState(0);
  const [weeklyLimit, setWeeklyLimit] = useState(0);

  const [categoryMap, setCategoryMap] = useState({});
  const [categoryLimits, setCategoryLimits] = useState({});

  const [warnings, setWarnings] = useState([]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        navigate("/");
        return;
      }

      setUser(u);
      setLoading(true);

      /* ===== FETCH EXPENSES ===== */
      const q = query(
        collection(db, "expenses"),
        where("uid", "==", u.uid)
      );
      const snap = await getDocs(q);

      let sum = 0;
      let weekSum = 0;
      const catMap = {};

      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      snap.forEach((d) => {
        const data = d.data();
        sum += data.amount;

        const date =
          data.date?.toDate?.() || new Date(data.date);

        if (date >= weekAgo) {
          weekSum += data.amount;
        }

        catMap[data.category] =
          (catMap[data.category] || 0) + data.amount;
      });

      setTotal(sum);
      setWeeklyTotal(weekSum);
      setCategoryMap(catMap);

      /* ===== FETCH USER LIMITS ===== */
      const userRef = doc(db, "users", u.uid);
      const userSnap = await getDoc(userRef);

      const mLimit = userSnap.data()?.monthlyLimit || 0;
      const wLimit = userSnap.data()?.weeklyLimit || 0;
      const cLimits = userSnap.data()?.categoryLimits || {};

      setMonthlyLimit(mLimit);
      setWeeklyLimit(wLimit);
      setCategoryLimits(cLimits);

      /* ===== WARNINGS ===== */
      const newWarnings = [];

      const check = (spent, limit, label) => {
        if (!limit) return;
        const percent = (spent / limit) * 100;

        if (percent >= 100)
          newWarnings.push(`🚨 ${label} limit exceeded`);
        else if (percent >= 90)
          newWarnings.push(`🔥 ${label} crossed 90%`);
        else if (percent >= 80)
          newWarnings.push(`⚠️ ${label} crossed 80%`);
        else if (percent >= 50)
          newWarnings.push(`ℹ️ ${label} crossed 50%`);
      };

      check(sum, mLimit, "Monthly");
      check(weekSum, wLimit, "Weekly");

      for (let cat in catMap) {
        check(
          catMap[cat],
          cLimits[cat],
          `${cat} category`
        );
      }

      setWarnings(newWarnings);
      setLoading(false);
    });

    return () => unsub();
  }, [navigate]);

  if (loading) {
    return (
      <div className="page">
        <div className="glass">
          <div className="h1">Loading Dashboard…</div>
          <div className="sub">Preparing your data</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="glass dashboard">
        <Navbar user={user} />

        <div className="h1">💸 Expense Dashboard</div>
        <div className="sub">
          Manual limits with smart warnings
        </div>

        <div className="cards">
          <div className="card">
            <div className="card-title">Monthly Spent</div>
            <div className="card-value">₹{total}</div>
          </div>

          <div className="card">
            <div className="card-title">Monthly Limit</div>
            <div className="card-value">₹{monthlyLimit}</div>
          </div>

          <div className="card">
            <div className="card-title">Weekly Spent</div>
            <div className="card-value">₹{weeklyTotal}</div>
          </div>

          <div className="card">
            <div className="card-title">Weekly Limit</div>
            <div className="card-value">₹{weeklyLimit}</div>
          </div>
        </div>

        {warnings.map((w, i) => (
          <div key={i} className="alert">
            {w}
          </div>
        ))}

        <ExpenseChart data={categoryMap} />

        <Link to="/profile" className="link-btn">
          ⚙️ Edit Limits
        </Link>
      </div>
    </div>
  );
}
