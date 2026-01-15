export const syncToSheet = (expense) => {
  const params = new URLSearchParams({
    requestId: crypto.randomUUID(), // ✅ UNIQUE
    date: expense.date,
    amount: expense.amount,
    category: expense.category,
    uid: expense.uid
  });

  const img = new Image();
  img.src = `https://script.google.com/macros/s/AKfycbz4BHbaIBVz3Zq-wfsoeUV7v7QGqUm7O_Tsw7PghNB2L6_e-Vj_N1HG5d5xx6dIPMjaJQ/exec?${params.toString()}`;
};
