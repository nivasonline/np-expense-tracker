import { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import LoadingScreen from "../components/LoadingScreen";
import { syncToSheet } from "../utils/syncToSheet";

export default function AddExpense() {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const addExpense = async () => {
    if (!amount) return alert("Enter amount");

    try {
      setLoading(true);
      const expense = {
        uid: auth.currentUser.uid,
        amount: Number(amount),
        category,
        date: new Date()
      };

      await addDoc(collection(db, "expenses"), expense);
      syncToSheet({ ...expense, date: expense.date.toISOString() });
      navigate("/dashboard");
    } catch {
      alert("Failed to save expense");
      setLoading(false);
    }
  };

  if (loading) return <LoadingScreen text="Saving expense..." />;

  return (
    <div className="page">
      <div className="glass" style={{ width: 480 }}>
        <div className="h1">Add Expense</div>
        <div className="sub">Log your spending</div>

        <label>Amount</label>
        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} />

        <label>Category</label>
        <select value={category} onChange={e => setCategory(e.target.value)}>
          <option>Food</option>
          <option>Health</option>
          <option>Travel</option>
          <option>Entertainment</option>
          <option>Bills</option>
          <option>Shopping</option>
          <option>Other</option>
        </select>

        <button className="btn" onClick={addExpense}>Save Expense</button>
      </div>
    </div>
  );
}
