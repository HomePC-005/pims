import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import './FloorPlan.css'; // We will write this CSS next



const FloorPlanApp = () => {
  const [selectedCabinet, setSelectedCabinet] = useState(null);

  const cabinets = [
    // --- Kaunter Depan ---
    { id: 'A', top: '24%', left: '54%', width: '25.5%', height: '5.5%' },
    { id: 'B', top: '29.5%', left: '54%', width: '25.5%', height: '5.5%' },
    { id: 'C', top: '42.8%', left: '50.5%', width: '29.3%', height: '8.5%' },

    // --- DDA Cabinet ---
    { id: 'DD', top: '53%', left: '77%', width: '4%', height: '10%' },

    // --- Rak Ubat Injection ---
    { id: 'H', top: '53%', left: '1.5%', width: '13.5%', height: '8.5%' },
    { id: 'I', top: '53%', left: '15%', width: '14%', height: '8.5%' },
    { id: 'J', top: '53%', left: '29%', width: '14%', height: '8.5%' },

    // --- Rak Ubat OPD ---
    { id: 'K', top: '90%', left: '18%', width: '8.5%', height: '8.3%' },
    { id: 'G', top: '90%', left: '30%', width: '14.5%', height: '8.3%' },
    { id: 'F', top: '90%', left: '44.5%', width: '14.5%', height: '8.3%' },
    { id: 'E', top: '90%', left: '59%', width: '14.5%', height: '8.3%' },
    { id: 'D', top: '90%', left: '73.5%', width: '14%', height: '8.3%' },

    // --- Fridge Pharmaceutical ---
    { id: 'Fr', top: '75%', left: '4.5%', width: '7%', height: '9%' },
  ];

  return (
    <div className="app-container">
      <h1>Farmasi Kecemasan - Floor Plan</h1>

      {/* THE MAP CONTAINER */}
      <div className="map-wrapper">
        <img src="https://pfredz-hsgt.github.io/imgres/floor/floorplan.png" alt="Pharmacy Floor Plan" className="map-image" />

        {/* Render Clickable Zones */}
        {cabinets.map((cab) => (
          <div
            key={cab.id}
            className="cabinet-zone"
            style={{
              top: cab.top,
              left: cab.left,
              width: cab.width,
              height: cab.height,
            }}
            onClick={() => setSelectedCabinet(cab.id)}
            title={`Cabinet ${cab.id}`} // Tooltip on hover
          >
            <span className="zone-label">{cab.id}</span>
          </div>
        ))}
      </div>

      {/* THE MODAL (Shows when a cabinet is selected) */}
      {selectedCabinet && (
        <CabinetModal
          cabinetId={selectedCabinet}
          onClose={() => setSelectedCabinet(null)}
        />
      )}
    </div>
  );
};

// --- Sub-Component: The Popup Modal ---
const CabinetModal = ({ cabinetId, onClose }) => {
  const [selectedRow, setSelectedRow] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch items when a row is clicked
  const fetchItems = async (rowNum) => {
    setLoading(true);
    setSelectedRow(rowNum);

    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('cabinet_id', cabinetId)
      .eq('row_number', rowNum);

    if (error) console.error('Error fetching:', error);
    else setItems(data || []);

    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Cabinet {cabinetId}</h2>
          <button onClick={onClose} className="close-btn"> X </button>
        </div>

        <div className="modal-body">
          {/* Left Side: 6 Clickable Rows */}
          <div className="shelf-tower">
            <h3>Select a Row</h3>
            {[1, 2, 3, 4, 5, 6].map((rowNum) => (
              <div
                key={rowNum}
                className={`shelf-row ${selectedRow === rowNum ? 'active' : ''}`}
                onClick={() => fetchItems(rowNum)}
              >
                Row {rowNum}
              </div>
            ))}
          </div>

          {/* Right Side: Item Display */}
          <div className="items-display">
            <h3>Items in Row {selectedRow ? selectedRow : '...'}</h3>

            {loading && <p>Loading...</p>}

            {!loading && selectedRow && items.length === 0 && (
              <p className="text-muted">No items found in this row.</p>
            )}

            <ul className="item-list">
              {items.map((item) => (
                <li key={item.id}>
                  <strong>{item.item_name}</strong>
                  <span className="qty">Qty: {item.quantity}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloorPlanApp;