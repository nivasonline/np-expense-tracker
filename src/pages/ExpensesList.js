import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import LoadingScreen from "../components/LoadingScreen";

/* CATEGORY ICONS */
const ICONS = {
  Food: "🍔",
  Travel: "✈️",
  Shopping: "🛍️",
  Bills: "💡",
  Health: "💊",
  Entertainment: "🎬",
  Other: "📦"
};

const getYesterdayString = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toDateString();
};

export default function ExpensesList() {
  const navigate = useNavigate();
  const location = useLocation();
  const filter = location.state?.filter || "all";

  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState({});

  useEffect(() => {
    const load = async () => {
      const q = query(
        collection(db, "expenses"),
        where("uid", "==", auth.currentUser.uid)
      );

      const snap = await getDocs(q);

      const now = new Date();
      const yesterday = getYesterdayString();
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const grouped = {};

      snap.forEach((doc) => {
        const data = doc.data();
        const date = data.date?.toDate?.() || new Date(data.date);
        const dateStr = date.toDateString();

        if (filter === "weekly" && date < weekAgo) return;
        if (filter === "monthly" && date.getMonth() !== now.getMonth()) return;

        const label =
          dateStr === now.toDateString()
            ? "Today"
            : dateStr === yesterday
            ? "Yesterday"
            : dateStr;

        if (!grouped[label]) grouped[label] = [];
        grouped[label].push({ ...data, date });
      });

      const sortedKeys = Object.keys(grouped).sort((a, b) => {
        if (a === "Today") return -1;
        if (b === "Today") return 1;
        if (a === "Yesterday") return -1;
        if (b === "Yesterday") return 1;
        return new Date(b) - new Date(a);
      });

      const sorted = {};
      sortedKeys.forEach((k) => (sorted[k] = grouped[k]));

      setGroups(sorted);
      setLoading(false);
    };

    load();
  }, [filter]);

  if (loading) return <LoadingScreen text="Loading expenses..." />;

  return (
    <div className="page">
      <div className="glass dashboard">
        <Navbar />

        <div className="h1">Expenses</div>
        <div className="sub">
          {filter === "monthly" && "This month"}
          {filter === "weekly" && "This week"}
          {filter === "all" && "All records"}
        </div>

        {/* EMPTY */}
        {Object.keys(groups).length === 0 && (
          <div className="empty-state">
            <div className="empty-emoji">📭</div>
            <div className="empty-title">No expenses found</div>
            <div className="empty-sub">Add your first expense</div>
          </div>
        )}

        {/* GROUPS */}
        {Object.entries(groups).map(([day, items]) => {
          const total = items.reduce((s, i) => s + i.amount, 0);

          return (
            <div className="day-group" key={day}>
              <div className="day-header">
                <span>{day}</span>
                <span className="day-total">₹{total}</span>
              </div>

              {items.map((item, index) => (
                <div className="expense-row" key={index}>
                  <div className="expense-left">
                    <div className="expense-icon">
                      {ICONS[item.category] || "📦"}
                    </div>

                    <div className="expense-info">
                      <div className="expense-cat">{item.category}</div>
                      <div className="expense-time">
                        {item.date.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="expense-amount">₹{item.amount}</div>
                </div>
              ))}
            </div>
          );
        })}

        <button className="btn" onClick={() => navigate("/dashboard")}>
          ⬅ Back
        </button>
      </div>
    </div>
  );
}
