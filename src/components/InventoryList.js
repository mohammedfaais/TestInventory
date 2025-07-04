import React, { useState } from "react";

const InventoryList = ({ items, deleteItem, editItem }) => {
  const [editModeId, setEditModeId] = useState(null);
  const [updatedData, setUpdatedData] = useState({});

  const handleEdit = (item) => {
    setEditModeId(item.id);
    setUpdatedData(item);
  };

  const handleSave = () => {
    editItem(updatedData);
    setEditModeId(null);
  };

  return (
    <div>
      <h2>Inventory List</h2>
      <table border="1">
        <thead>
          <tr>
            <th>Name</th><th>Qty</th><th>Price</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) =>
            editModeId === item.id ? (
              <tr key={item.id}>
                <td><input value={updatedData.name} onChange={(e) => setUpdatedData({ ...updatedData, name: e.target.value })} /></td>
                <td><input value={updatedData.qty} onChange={(e) => setUpdatedData({ ...updatedData, qty: e.target.value })} /></td>
                <td><input value={updatedData.price} onChange={(e) => setUpdatedData({ ...updatedData, price: e.target.value })} /></td>
                <td>
                  <button onClick={handleSave}>Save</button>
                  <button onClick={() => setEditModeId(null)}>Cancel</button>
                </td>
              </tr>
            ) : (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.qty}</td>
                <td>₹{item.price}</td>
                <td>
                  <button onClick={() => handleEdit(item)}>Edit</button>
                  <button onClick={() => deleteItem(item.id)}>Delete</button>
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
};

export default InventoryList;
