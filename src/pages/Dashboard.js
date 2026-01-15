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
  const [categoryLimits, setCategoryLimits] = useState({});
  const [warnings, setWarnings] = useState([]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) return navigate("/");

      setUser(u);
      setLoading(true);

      const q = query(
        collection(db, "expenses"),
        where("uid", "==", u.uid)
      );
      const snap = await getDocs(q);

      let sum = 0, weekSum = 0;
      const catMap = {};
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      snap.forEach(d => {
        const data = d.data();
        sum += data.amount;
        const date = data.date?.toDate?.() || new Date(data.date);
        if (date >= weekAgo) weekSum += data.amount;
        catMap[data.category] = (catMap[data.category] || 0) + data.amount;
      });

      setTotal(sum);
      setWeeklyTotal(weekSum);
      setCategoryMap(catMap);

      const userSnap = await getDoc(doc(db, "users", u.uid));
      const mLimit = userSnap.data()?.monthlyLimit || 0;
      const wLimit = userSnap.data()?.weeklyLimit || 0;
      const cLimits = userSnap.data()?.categoryLimits || {};

      setMonthlyLimit(mLimit);
      setWeeklyLimit(wLimit);
      setCategoryLimits(cLimits);

      const warns = [];
      const check = (s, l, t) => {
        if (!l) return;
        const p = (s / l) * 100;
        if (p >= 100) warns.push(`🚨 ${t} limit exceeded`);
        else if (p >= 90) warns.push(`🔥 ${t} crossed 90%`);
        else if (p >= 80) warns.push(`⚠️ ${t} crossed 80%`);
        else if (p >= 50) warns.push(`ℹ️ ${t} crossed 50%`);
      };

      check(sum, mLimit, "Monthly");
      check(weekSum, wLimit, "Weekly");
      Object.keys(catMap).forEach(c =>
        check(catMap[c], cLimits[c], `${c} category`)
      );

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

        <div className="h1">Expense Dashboard</div>
        <div className="sub">Manual limits with smart alerts</div>

        <div className="cards">
          <div className="card"><div className="card-title">Monthly Spent</div><div className="card-value">₹{total}</div></div>
          <div className="card"><div className="card-title">Monthly Limit</div><div className="card-value">₹{monthlyLimit}</div></div>
          <div className="card"><div className="card-title">Weekly Spent</div><div className="card-value">₹{weeklyTotal}</div></div>
          <div className="card"><div className="card-title">Weekly Limit</div><div className="card-value">₹{weeklyLimit}</div></div>
        </div>

        {warnings.map((w, i) => <div key={i} className="alert">{w}</div>)}

        <ExpenseChart data={categoryMap} />
        <div
  className="button-row"
  style={{ display: "flex", gap: 20, marginTop: 30 }}
>
  <Link to="/add" className="link-btn">
    ➕ Add Expense
  </Link>

  <Link to="/profile" className="link-btn">
    ⚙️ Edit Limits
  </Link>
</div>


      </div>
    </div>
  );
}
