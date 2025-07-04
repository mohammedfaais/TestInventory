import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { unparse } from "papaparse";

const App = () => {
  const [tab, setTab] = useState("inventory");
  const [items, setItems] = useState(() => JSON.parse(localStorage.getItem("inventory")) || []);
  const [sales, setSales] = useState(() => JSON.parse(localStorage.getItem("sales")) || []);

  // Inventory
  const [name, setName] = useState("");
  const [qty, setQty] = useState("");
  const [price, setPrice] = useState("");
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editQty, setEditQty] = useState("");
  const [editPrice, setEditPrice] = useState("");

  // Sales
  const [selectedProductId, setSelectedProductId] = useState("");
  const [saleQty, setSaleQty] = useState("");

  useEffect(() => {
    localStorage.setItem("inventory", JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem("sales", JSON.stringify(sales));
  }, [sales]);

  const addItem = (e) => {
    e.preventDefault();
    if (!name || !qty || !price) return;
    setItems([
      ...items,
      { id: Date.now(), name, qty: parseInt(qty), price: parseFloat(price) },
    ]);
    setName("");
    setQty("");
    setPrice("");
  };

  const deleteItem = (id) => setItems(items.filter((item) => item.id !== id));

  const startEdit = (item) => {
    setEditId(item.id);
    setEditName(item.name);
    setEditQty(item.qty);
    setEditPrice(item.price);
  };

  const cancelEdit = () => setEditId(null);

  const saveEdit = (id) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, name: editName, qty: parseInt(editQty), price: parseFloat(editPrice) } : item
    ));
    cancelEdit();
  };

  const handleSale = (e) => {
    e.preventDefault();
    const product = items.find(item => item.id === parseInt(selectedProductId));
    const quantity = parseInt(saleQty);
    if (!product || quantity <= 0 || quantity > product.qty) return alert("Invalid sale");

    const date = new Date().toISOString().split("T")[0];
    setSales([...sales, {
      id: Date.now(),
      productId: product.id,
      productName: product.name,
      qty: quantity,
      price: product.price,
      total: quantity * product.price,
      date,
    }]);

    setItems(items.map(item =>
      item.id === product.id ? { ...item, qty: item.qty - quantity } : item
    ));

    setSelectedProductId("");
    setSaleQty("");
  };

  const totalRevenueToday = sales
    .filter((s) => s.date === new Date().toISOString().split("T")[0])
    .reduce((total, s) => total + s.total, 0);

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Inventory Report", 14, 22);
    const tableColumn = ["Name", "Qty", "Price"];
    const tableRows = items.map((item) => [item.name, item.qty, item.price]);
    doc.autoTable({ head: [tableColumn], body: tableRows, startY: 30 });
    doc.save("inventory.pdf");
  };

  const handleExportCSV = () => {
    const csv = unparse(items);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "inventory.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>🧾 Inventory & Sales</h2>

      <div style={styles.tabContainer}>
        <button onClick={() => setTab("inventory")} style={tab === "inventory" ? styles.activeTab : styles.tab}>📦 Inventory</button>
        <button onClick={() => setTab("sales")} style={tab === "sales" ? styles.activeTab : styles.tab}>💵 Sales</button>
      </div>

      {/* Inventory Section */}
      {tab === "inventory" && (
        <>
          <form onSubmit={addItem} style={styles.form}>
            <input style={styles.input} placeholder="Product Name" value={name} onChange={(e) => setName(e.target.value)} />
            <input style={styles.input} type="number" placeholder="Quantity" value={qty} onChange={(e) => setQty(e.target.value)} />
            <input style={styles.input} type="number" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} />
            <button style={styles.button}>➕ Add</button>
          </form>

          <div style={styles.exportRow}>
            <button onClick={handleExportCSV} style={styles.exportButton}>⬇️ Export CSV</button>
            <button onClick={handleExportPDF} style={styles.exportButton}>🧾 Export PDF</button>
          </div>

          <h4 style={{ marginTop: 12 }}>💰 Inventory Value: ₹{items.reduce((total, i) => total + i.qty * i.price, 0)}</h4>

          {items.map(item =>
            editId === item.id ? (
              <div key={item.id} style={styles.card}>
                <input style={styles.input} value={editName} onChange={(e) => setEditName(e.target.value)} />
                <input style={styles.input} value={editQty} type="number" onChange={(e) => setEditQty(e.target.value)} />
                <input style={styles.input} value={editPrice} type="number" onChange={(e) => setEditPrice(e.target.value)} />
                <div style={styles.row}>
                  <button style={styles.button} onClick={() => saveEdit(item.id)}>💾 Save</button>
                  <button style={styles.deleteButton} onClick={cancelEdit}>❌ Cancel</button>
                </div>
              </div>
            ) : (
              <div key={item.id} style={{ ...styles.card, backgroundColor: item.qty < 5 ? "#fff4f4" : "#f9f9f9" }}>
                <strong>{item.name}</strong>
                <p>Qty: {item.qty} {item.qty < 5 && <span style={{ color: "red" }}>⚠️ Low</span>}</p>
                <p>Price: ₹{item.price}</p>
                <div style={styles.row}>
                  <button style={styles.button} onClick={() => startEdit(item)}>✏️ Edit</button>
                  <button style={styles.deleteButton} onClick={() => deleteItem(item.id)}>🗑 Delete</button>
                </div>
              </div>
            )
          )}
        </>
      )}

      {/* Sales Section */}
      {tab === "sales" && (
        <>
          <form onSubmit={handleSale} style={styles.form}>
            <select style={styles.input} value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)} required>
              <option value="">Select Product</option>
              {items.map((item) => (
                <option key={item.id} value={item.id}>{item.name} (Stock: {item.qty})</option>
              ))}
            </select>
            <input style={styles.input} type="number" placeholder="Qty Sold" value={saleQty} onChange={(e) => setSaleQty(e.target.value)} required />
            <button style={styles.button}>Sell</button>
          </form>

          <h4 style={{ marginTop: 12 }}>📅 Today's Revenue: ₹{totalRevenueToday}</h4>

          {sales.slice().reverse().map((sale) => (
            <div key={sale.id} style={styles.card}>
              <strong>{sale.productName}</strong>
              <p>Qty: {sale.qty}</p>
              <p>₹{sale.price} x {sale.qty} = ₹{sale.total}</p>
              <p>🗓 {sale.date}</p>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: 16,
    maxWidth: 500,
    margin: "0 auto",
    fontFamily: "sans-serif",
  },
  heading: {
    textAlign: "center",
    marginBottom: 16,
  },
  tabContainer: {
    display: "flex",
    justifyContent: "center",
    gap: 8,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    padding: 10,
    background: "#eee",
    border: "none",
    cursor: "pointer",
  },
  activeTab: {
    flex: 1,
    padding: 10,
    background: "#4caf50",
    color: "#fff",
    border: "none",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    marginBottom: 16,
  },
  input: {
    padding: 10,
    fontSize: 16,
    borderRadius: 4,
    border: "1px solid #ccc",
  },
  button: {
    padding: 10,
    background: "#2196f3",
    color: "#fff",
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
  },
  deleteButton: {
    padding: 10,
    background: "#f44336",
    color: "#fff",
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
    marginLeft: 8,
  },
  card: {
    background: "#f9f9f9",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
  },
  row: {
    display: "flex",
    gap: 8,
    marginTop: 8,
  },
  exportRow: {
    display: "flex",
    gap: 8,
    marginTop: 12,
  },
  exportButton: {
    padding: 8,
    fontSize: 14,
    border: "1px solid #aaa",
    background: "#fff",
    cursor: "pointer",
  },
};

export default App;
