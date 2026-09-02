import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Table, Modal, Tooltip, Tag, Space, Card, Select, Button, Form, Input, message } from 'antd';
import { WarningOutlined, EditOutlined } from '@ant-design/icons';
import BinL from './BinL';
import BinM from './BinM';
import BinS from './BinS';
import './DynamicCabinet.css';

const templates = {
  M15S8: {
    id: 'M15S8',
    name: 'Template M15S8',
    getColumns: () => {
      const mBins = Array.from({ length: 15 }, (_, i) => `M${i + 1}`);
      const sBins = Array.from({ length: 8 }, (_, i) => `S${i + 1}`);
      return [
        { type: 'M', items: [mBins[0], mBins[5], mBins[10]], width: 14 },
        { type: 'M', items: [mBins[1], mBins[6], mBins[11]], width: 14 },
        { type: 'M', items: [mBins[2], mBins[7], mBins[12]], width: 14 },
        { type: 'M', items: [mBins[3], mBins[8], mBins[13]], width: 14 },
        { type: 'M', items: [mBins[4], mBins[9], mBins[14]], width: 14 },
        { type: 'S', items: [sBins[0], sBins[2], sBins[4], sBins[6]], width: 9 },
        { type: 'S', items: [sBins[1], sBins[3], sBins[5], sBins[7]], width: 9 }
      ];
    }
  },
  L8S4: {
    id: 'L8S4',
    name: 'Template L8S4',
    getColumns: () => {
      const lBins = Array.from({ length: 8 }, (_, i) => `L${i + 1}`);
      const sBins = Array.from({ length: 4 }, (_, i) => `S${i + 1}`);
      return [
        { type: 'L', items: [lBins[0], lBins[4]], width: 23.1 },
        { type: 'L', items: [lBins[1], lBins[5]], width: 23.1 },
        { type: 'L', items: [lBins[2], lBins[6]], width: 23.1 },
        { type: 'L', items: [lBins[3], lBins[7]], width: 23.1 },
        { type: 'S', items: [sBins[0], sBins[1], sBins[2], sBins[3]], width: 9 }
      ];
    }
  },
  L8: {
    id: 'L8',
    name: 'Template L8',
    getColumns: () => {
      const lBins = Array.from({ length: 8 }, (_, i) => `L${i + 1}`);
      return [
        { type: 'L', items: [lBins[0], lBins[4]], width: 1 },
        { type: 'L', items: [lBins[1], lBins[5]], width: 1 },
        { type: 'L', items: [lBins[2], lBins[6]], width: 1 },
        { type: 'L', items: [lBins[3], lBins[7]], width: 1 }
      ];
    }
  },
  M9: {
    id: 'M9',
    name: 'Template M9',
    getColumns: () => {
      const mBins = Array.from({ length: 9 }, (_, i) => `M${i + 1}`);
      return [
        { type: 'M', items: [mBins[0], mBins[3], mBins[6]], width: 1 },
        { type: 'M', items: [mBins[1], mBins[4], mBins[7]], width: 1 },
        { type: 'M', items: [mBins[2], mBins[5], mBins[8]], width: 1 }
      ];
    }
  },
  M18: {
    id: 'M18',
    name: 'Template M18',
    getColumns: () => {
      const mBins = Array.from({ length: 18 }, (_, i) => `M${i + 1}`);
      return [
        { type: 'M', items: [mBins[0], mBins[6], mBins[12]], width: 1 },
        { type: 'M', items: [mBins[1], mBins[7], mBins[13]], width: 1 },
        { type: 'M', items: [mBins[2], mBins[8], mBins[14]], width: 1 },
        { type: 'M', items: [mBins[3], mBins[9], mBins[15]], width: 1 },
        { type: 'M', items: [mBins[4], mBins[10], mBins[16]], width: 1 },
        { type: 'M', items: [mBins[5], mBins[11], mBins[17]], width: 1 }
      ];
    }
  },
  S36: {
    id: 'S36',
    name: 'Template S36',
    getColumns: () => {
      const sBins = Array.from({ length: 36 }, (_, i) => `S${i + 1}`);
      return [
        { type: 'S', items: [sBins[0], sBins[9], sBins[18], sBins[27]], width: 1 },
        { type: 'S', items: [sBins[1], sBins[10], sBins[19], sBins[28]], width: 1 },
        { type: 'S', items: [sBins[2], sBins[11], sBins[20], sBins[29]], width: 1 },
        { type: 'S', items: [sBins[3], sBins[12], sBins[21], sBins[30]], width: 1 },
        { type: 'S', items: [sBins[4], sBins[13], sBins[22], sBins[31]], width: 1 },
        { type: 'S', items: [sBins[5], sBins[14], sBins[23], sBins[32]], width: 1 },
        { type: 'S', items: [sBins[6], sBins[15], sBins[24], sBins[33]], width: 1 },
        { type: 'S', items: [sBins[7], sBins[16], sBins[25], sBins[34]], width: 1 },
        { type: 'S', items: [sBins[8], sBins[17], sBins[26], sBins[35]], width: 1 }
      ];
    }
  }
};

const DynamicCabinet = () => {
  const [selectedBin, setSelectedBin] = useState('null');

  const [mappedShelves, setMappedShelves] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);

  const [allItems, setAllItems] = useState([]);
  const [occupiedBins, setOccupiedBins] = useState({});

  const [isBinModalVisible, setIsBinModalVisible] = useState(false);
  const [clickedBinInfo, setClickedBinInfo] = useState(null);

  const [directEditModalVisible, setDirectEditModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editForm] = Form.useForm();

  const fetchAllData = async () => {
    // Only fetch shelves for D, E, F
    const { data: shelfData, error: shelfError } = await supabase
      .from('shelf_templates')
      .select('*')
      .in('section', ['D', 'E', 'F'])
      .order('section')
      .order('row');

    if (!shelfError && shelfData) {
      setMappedShelves(shelfData);
      // Initialize to first section if not set
      setSelectedSection(prev => prev || (shelfData.length > 0 ? shelfData[0].section : null));
    }

    // Fetch items for D, E, F
    const { data: itemData, error: itemError } = await supabase
      .from('inventory_items')
      .select('*')
      .in('section', ['D', 'E', 'F']);

    if (!itemError && itemData) {
      try {
        setAllItems(itemData);

        const occ = {};
        itemData.forEach(item => {
          if (item.section && item.row && item.bin) {
            const key = `${item.section}_${item.row}_${item.bin}`;
            if (!occ[key]) {
              occ[key] = [];
            }
            occ[key].push(item);
          }
        });
        setOccupiedBins(occ);
      } catch (err) {
        console.error("Error processing items:", err);
        setAllItems(itemData); // fallback to unsorted
      }
    } else if (itemError) {
      console.error("Error fetching items:", itemError);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const sortedTableItems = React.useMemo(() => {
    return [...allItems].sort((a, b) => {
      // 1. Prioritize selectedSection
      if (a.section === selectedSection && b.section !== selectedSection) return -1;
      if (a.section !== selectedSection && b.section === selectedSection) return 1;

      // 2. Sort by Section (alphabetical) if neither or both are selected
      const aSec = a.section || '';
      const bSec = b.section || '';
      if (aSec !== bSec) return aSec.localeCompare(bSec);

      // 3. Sort by Row (descending: highest row to lowest row)
      const aRow = a.row || 0;
      const bRow = b.row || 0;
      if (aRow !== bRow) return bRow - aRow;

      // 4. Sort by Bin (character then number)
      const aBin = a.bin || '';
      const bBin = b.bin || '';
      const aMatch = aBin.match(/([A-Z]+)(\d+)/);
      const bMatch = bBin.match(/([A-Z]+)(\d+)/);

      if (aMatch && bMatch) {
        if (aMatch[1] === bMatch[1]) {
          return parseInt(aMatch[2], 10) - parseInt(bMatch[2], 10);
        }
        return aMatch[1].localeCompare(bMatch[1]);
      }
      return aBin.localeCompare(bBin);
    });
  }, [allItems, selectedSection]);

  const validLocations = React.useMemo(() => {
    const valid = new Set();
    mappedShelves.forEach(shelf => {
      const cols = templates[shelf.template_id]?.getColumns() || [];
      cols.forEach(c => c.items.forEach(bin => {
        valid.add(`${shelf.section}_${shelf.row}_${bin}`);
      }));
    });
    return valid;
  }, [mappedShelves]);

  const uniqueSections = [...new Set(mappedShelves.map(s => s.section))].sort();

  const handleBinClick = (binId, row) => {
    setSelectedBin(`${row}_${binId}`);
    const itemsInBin = occupiedBins[`${selectedSection}_${row}_${binId}`];
    if (itemsInBin && itemsInBin.length > 0) {
      openDirectEditModal(itemsInBin[0]); // Edit the first item in the bin
    }
  };

  const openDirectEditModal = (item) => {
    setEditingItem(item);
    editForm.setFieldsValue({
      section: item.section,
      row: item.row,
      bin: item.bin
    });
    setDirectEditModalVisible(true);
  };

  const handleEditSubmit = async (values) => {
    try {
      const { error } = await supabase
        .from('inventory_items')
        .update({
          section: values.section,
          row: values.row,
          bin: values.bin
        })
        .eq('id', editingItem.id);

      if (error) throw error;
      message.success('Item location updated!');
      setDirectEditModalVisible(false);
      setEditingItem(null);

      fetchAllData(); // Refresh data visually
    } catch (err) {
      message.error('Failed to update item location');
    }
  };

  const rowsForSection = mappedShelves
    .filter(s => s.section === selectedSection)
    .sort((a, b) => b.row - a.row); // Higher row at top, lower row at bottom

  const tableColumns = [
    {
      title: 'Item Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => {
        const isValidLocation = validLocations.has(`${record.section}_${record.row}_${record.bin}`);
        return (
          <Space>
            <a onClick={(e) => {
              e.stopPropagation();
              openDirectEditModal(record);
            }}>
              {text}
            </a>
            {!isValidLocation && (
              <Tooltip title={`Location ${record.section}-${record.row}-${record.bin} has no place in the visualizer!`}>
                <WarningOutlined style={{ color: '#faad14' }} />
              </Tooltip>
            )}
          </Space>
        );
      }
    },
    {
      title: 'Rak',
      dataIndex: 'section',
      key: 'section',
      width: 60,
    },
    {
      title: 'Tingkat',
      dataIndex: 'row',
      key: 'row',
      width: 80,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 80,
    },
    {
      title: 'Bin',
      dataIndex: 'bin',
      key: 'bin',
      render: bin => <Tag color="blue">{bin}</Tag>
    }
  ];

  return (
    <div style={{ padding: '24px', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      <Card style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
          <Space size="middle">
            <span style={{ fontWeight: 500 }}>Rak (Section):</span>
            {uniqueSections.map(sec => (
              <Tag
                key={sec}
                color={selectedSection === sec ? 'blue' : 'default'}
                style={{ cursor: 'pointer', fontSize: '14px', padding: '4px 16px', userSelect: 'none' }}
                onClick={() => {
                  setSelectedSection(sec);
                  setSelectedBin('null');
                }}
              >
                Rak {sec}
              </Tag>
            ))}
          </Space>
        </div>
      </Card>

      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', width: '100%', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Cabinet Layout */}
        <Card style={{ flex: 2, minWidth: '600px' }} title={<div style={{ textAlign: 'center', width: '100%', fontSize: '24px', fontWeight: 'bold' }}>{selectedSection ? `Rak ${selectedSection}` : 'Select a Rak'}</div>} bodyStyle={{ padding: 16, display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {!selectedSection ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#888' }}>
              <h3 style={{ color: '#666', marginTop: 0 }}>Please select a Rak</h3>
              <p style={{ marginBottom: 0 }}>Choose a Rak from the dropdown above to visualize all its tingkats (rows).</p>
            </div>
          ) : rowsForSection.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#888' }}>
              <p style={{ marginBottom: 0 }}>No tingkats configured for Rak {selectedSection}.</p>
            </div>
          ) : (
            rowsForSection.map((shelf) => {
              const currentColumns = templates[shelf.template_id]?.getColumns() || [];
              return (
                <div key={shelf.id} style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '8px', borderBottom: '1px solid #eee', paddingBottom: '4px' }}>Tingkat {shelf.row}</div>
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'stretch' }}>
                    {currentColumns.map((col, colIndex) => (
                      <div
                        key={colIndex}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px',
                          flex: col.width,
                        }}
                      >
                        {col.items.map((binId) => {
                          const itemsInBin = occupiedBins[`${selectedSection}_${shelf.row}_${binId}`] || [];
                          const isOccupied = itemsInBin.length > 0;
                          const binClass = isOccupied ? 'occupied-bin' : 'empty-bin';
                          const isTarget = selectedBin === `${shelf.row}_${binId}`;
                          const targetClass = isTarget ? 'target-bin' : '';

                          const tooltipTitle = isOccupied
                            ? itemsInBin.map(i => i.name).join(', ')
                            : 'Empty Bin';

                          return (
                            <Tooltip key={binId} title={tooltipTitle} placement="top">
                              <div
                                className={`bin-wrapper ${targetClass} ${binClass}`}
                                style={{
                                  position: 'relative',
                                  width: '100%',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  justifyContent: 'flex-end',
                                  flex: 1,
                                  cursor: 'pointer'
                                }}
                              >
                                {col.type === 'L' && (
                                  <BinL id={binId} isTarget={isTarget} onClick={() => handleBinClick(binId, shelf.row)} />
                                )}
                                {col.type === 'M' && (
                                  <BinM id={binId} isTarget={isTarget} onClick={() => handleBinClick(binId, shelf.row)} />
                                )}
                                {col.type === 'S' && (
                                  <BinS id={binId} isTarget={isTarget} onClick={() => handleBinClick(binId, shelf.row)} />
                                )}
                                <span style={{
                                  position: 'absolute',
                                  bottom: '10%',
                                  left: '50%',
                                  transform: 'translateX(-50%)',
                                  color: '#333',
                                  fontSize: '0.8rem',
                                  fontFamily: 'sans-serif',
                                  pointerEvents: 'none',
                                  fontWeight: 'bold'
                                }}>
                                  {binId}
                                </span>
                              </div>
                            </Tooltip>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </Card>

        {/* Data Table Layout */}
        <Card style={{ flex: 1, overflowX: 'auto' }} title={`Items in Rak D, E, F`} bodyStyle={{ padding: 16 }}>
          <Table
            dataSource={sortedTableItems}
            columns={tableColumns}
            rowKey="id"
            pagination={{
              defaultPageSize: 50,
              showSizeChanger: true,
              pageSizeOptions: ['20', '50', '100', '200']
            }}
            size="small"
            onRow={(record) => ({
              onClick: () => {
                setSelectedBin(`${record.row}_${record.bin}`);
                setSelectedSection(record.section);
              },
              style: { cursor: 'pointer', backgroundColor: selectedBin === `${record.row}_${record.bin}` && selectedSection === record.section ? '#e6f7ff' : 'transparent' }
            })}
          />
        </Card>
      </div>

      <Modal
        title="Edit Item Location"
        open={directEditModalVisible}
        onCancel={() => {
          setDirectEditModalVisible(false);
          setEditingItem(null);
        }}
        footer={null}
      >
        {editingItem && (
          <Form form={editForm} layout="vertical" onFinish={handleEditSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
              <strong style={{ fontSize: '15px', marginBottom: '8px' }}>Editing: {editingItem.name}</strong>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Form.Item name="section" label="Rak" style={{ margin: 0, flex: 1 }} rules={[{ required: true }]}>
                  <Input placeholder="Rak" />
                </Form.Item>
                <Form.Item name="row" label="Tingkat" style={{ margin: 0, flex: 1 }} rules={[{ required: true }]}>
                  <Input placeholder="Tingkat" />
                </Form.Item>
                <Form.Item name="bin" label="Bin" style={{ margin: 0, flex: 1 }} rules={[{ required: true }]}>
                  <Input placeholder="Bin" />
                </Form.Item>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
                <Button onClick={() => {
                  setDirectEditModalVisible(false);
                  setEditingItem(null);
                }}>Cancel</Button>
                <Button type="primary" htmlType="submit">Save Location</Button>
              </div>
            </div>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default DynamicCabinet;
