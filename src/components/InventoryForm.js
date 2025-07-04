import React, { useState } from "react";

const InventoryForm = ({ addItem }) => {
  const [name, setName] = useState("");
  const [qty, setQty] = useState("");
  const [price, setPrice] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !qty || !price) return;
    addItem({
      id: Date.now(),
      name,
      qty: parseInt(qty),
      price: parseFloat(price),
    });
    setName("");
    setQty("");
    setPrice("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input placeholder="Product Name" value={name} onChange={(e) => setName(e.target.value)} />
      <input placeholder="Quantity" value={qty} onChange={(e) => setQty(e.target.value)} type="number" />
      <input placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} type="number" />
      <button type="submit">Add Item</button>
    </form>
  );
};

export default InventoryForm;
