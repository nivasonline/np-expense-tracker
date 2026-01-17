import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AddExpense from "./pages/AddExpense";
import Profile from "./pages/Profile";
import ExpensesList from "./pages/ExpensesList";



function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/add" element={<AddExpense />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/expenses" element={<ExpensesList />} />


      </Routes>
    </BrowserRouter>
  );
}

export default App;
