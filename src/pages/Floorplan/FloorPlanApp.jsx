import React, { useState, useEffect } from 'react';
import { Modal, Row, Col, Typography, Spin, Empty, Button, message, Segmented } from 'antd';
import { supabase } from '../../lib/supabase';
import DrugCard from '../../components/DrugCard';
import DrugDetailModal from '../Locator/DrugDetailModal'; // Reuse existing detail modal if needed
import './FloorPlan.css';

const { Title, Text } = Typography;

const FloorPlanApp = () => {
  const [selectedCabinet, setSelectedCabinet] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

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

  const handleCabinetClick = (cabId) => {
    setSelectedCabinet(cabId);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedCabinet(null);
  };

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
            onClick={() => handleCabinetClick(cab.id)}
            title={`Cabinet ${cab.id}`} // Tooltip on hover
          >
            <span className="zone-label">{cab.id}</span>
          </div>
        ))}
      </div>

      {/* THE MODAL (Shows when a cabinet is selected) */}
      <CabinetModal
        cabinetId={selectedCabinet}
        visible={isModalVisible}
        onClose={handleCloseModal}
      />
    </div>
  );
};

// --- Sub-Component: The Popup Modal ---
const CabinetModal = ({ cabinetId, visible, onClose }) => {
  const [selectedRow, setSelectedRow] = useState(1);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedDrug, setSelectedDrug] = useState(null);

  // Available rows - could be fetched dynamically, but hardcoded 1-6 for now as per likely requirement
  const rows = [1, 2, 3, 4, 5, 6];

  useEffect(() => {
    if (visible && cabinetId) {
      fetchItems(selectedRow);
    } else {
      // Reset state when closed
      setItems([]);
      setSelectedRow(1);
    }
  }, [visible, cabinetId]);

  // Fetch items when row changes
  useEffect(() => {
    if (visible && cabinetId) {
      fetchItems(selectedRow);
    }
  }, [selectedRow]);

  const fetchItems = async (rowNum) => {
    if (!cabinetId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('section', cabinetId) // User specified: cabinetID matches drug.section
        .eq('row', rowNum);       // User specified: row matches drug.row

      if (error) {
        console.error('Error fetching:', error);
        message.error('Failed to load items');
      } else {
        setItems(data || []);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDrugClick = (drug) => {
    setSelectedDrug(drug);
    setDetailModalVisible(true);
  };

  return (
    <>
      <Modal
        title={<Title level={3}>Cabinet {cabinetId}</Title>}
        open={visible}
        onCancel={onClose}
        footer={[
          <Button key="close" onClick={onClose}>
            Close
          </Button>
        ]}
        width={1000}
        centered
        destroyOnClose
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Row Selection */}
          <div>
            <Text type="secondary" style={{ marginRight: 10 }}>Select Row:</Text>
            <Segmented
              options={rows.map(r => ({ label: `Row ${r}`, value: r }))}
              value={selectedRow}
              onChange={setSelectedRow}
            />
          </div>

          {/* Content Area */}
          <div style={{ minHeight: '300px' }}>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
                <Spin size="large" />
              </div>
            ) : items.length > 0 ? (
              <Row gutter={[16, 16]}>
                {items.map((item) => (
                  <Col xs={24} sm={12} md={8} lg={6} key={item.id}>
                    <DrugCard
                      drug={item}
                      onClick={() => handleDrugClick(item)}
                    />
                  </Col>
                ))}
              </Row>
            ) : (
              <Empty description={`No items found in Row ${selectedRow}`} />
            )}
          </div>
        </div>
      </Modal>

      {/* Reuse Drug Detail Modal for consistent detailed view */}
      <DrugDetailModal
        drug={selectedDrug}
        visible={detailModalVisible}
        onClose={() => setDetailModalVisible(false)}
      />
    </>
  );
};

export default FloorPlanApp;