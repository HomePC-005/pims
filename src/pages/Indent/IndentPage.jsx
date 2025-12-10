import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Row,
    Col,
    Skeleton,
    Empty,
    Space,
    Button,
    Typography,
    message,
    Pagination,
    Input,
    List,
    Tag,
} from 'antd';
import {
    SearchOutlined,
    AppstoreOutlined,
    UnorderedListOutlined,
    EnvironmentOutlined,
} from '@ant-design/icons';
import { supabase } from '../../lib/supabase';
import { getTypeColor, getSourceColor } from '../../lib/colorMappings';
import DrugCard from '../../components/DrugCard';
import IndentModal from './IndentModal';

const { Title, Text } = Typography;

const IndentPage = () => {
    const [drugs, setDrugs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSection, setSelectedSection] = useState('ALL');
    const [selectedDrug, setSelectedDrug] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [sections, setSections] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(24);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

    useEffect(() => {
        fetchDrugs();
        setupRealtimeSubscription();
    }, []);

    // Reset to first page when section changes or search query changes
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedSection, searchQuery]);

    const fetchDrugs = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('inventory_items')
                .select('*')
                .order('section', { ascending: true })
                .order('row', { ascending: true })
                .order('bin', { ascending: true });

            if (error) throw error;

            setDrugs(data || []);

            // Extract unique sections
            const uniqueSections = [...new Set(data.map(d => d.section))].sort();
            setSections(uniqueSections);
        } catch (error) {
            console.error('Error fetching drugs:', error);
            message.error('Failed to load inventory items');
        } finally {
            setLoading(false);
        }
    };

    const setupRealtimeSubscription = () => {
        const subscription = supabase
            .channel('inventory_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'inventory_items',
                },
                (payload) => {
                    console.log('Realtime update:', payload);
                    fetchDrugs(); // Refresh data on any change
                }
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    };

    // Memoize filtered drugs to prevent unnecessary recalculations
    const filteredDrugs = useMemo(() => {
        let result = drugs;

        // Filter by section
        if (selectedSection !== 'ALL') {
            result = result.filter(drug => drug.section === selectedSection);
        }

        // Filter by search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(drug =>
                drug.name?.toLowerCase().includes(query) ||
                drug.generic_name?.toLowerCase().includes(query) ||
                drug.location_code?.toLowerCase().includes(query)
            );
        }

        return result;
    }, [selectedSection, searchQuery, drugs]);

    // Memoize paginated drugs
    const paginatedDrugs = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        return filteredDrugs.slice(startIndex, endIndex);
    }, [filteredDrugs, currentPage, pageSize]);

    // Use useCallback to prevent unnecessary re-renders
    const handleDrugClick = useCallback((drug) => {
        setSelectedDrug(drug);
        setModalVisible(true);
    }, []);

    const handlePageChange = useCallback((page, newPageSize) => {
        setCurrentPage(page);
        if (newPageSize !== pageSize) {
            setPageSize(newPageSize);
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [pageSize]);

    const handleIndentSuccess = useCallback(() => {
        setModalVisible(false);
        message.success('Item added to cart successfully!');
    }, []);

    return (
        <div>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                {/* Header */}
                <div>
                    <Title level={3}>Indent Management</Title>
                    <Text type="secondary">
                        Select items to add to your indent cart
                    </Text>
                </div>

                {/* Section Filter */}
                <Space wrap>
                    <Button
                        type={selectedSection === 'ALL' ? 'primary' : 'default'}
                        onClick={() => setSelectedSection('ALL')}
                    >
                        All Sections
                    </Button>
                    {sections.map(section => (
                        <Button
                            key={section}
                            type={selectedSection === section ? 'primary' : 'default'}
                            onClick={() => setSelectedSection(section)}
                        >
                            Section {section}
                        </Button>
                    ))}
                </Space>

                {/* Search Bar and View Toggle */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
                    <Input
                        placeholder="Search by name, generic name, or location..."
                        prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        allowClear
                        size="large"
                        style={{ flex: '1 1 300px', minWidth: '200px' }}
                    />
                    <Space>
                        <Button
                            type={viewMode === 'grid' ? 'primary' : 'default'}
                            icon={<AppstoreOutlined />}
                            onClick={() => setViewMode('grid')}
                        />
                        <Button
                            type={viewMode === 'list' ? 'primary' : 'default'}
                            icon={<UnorderedListOutlined />}
                            onClick={() => setViewMode('list')}
                        />
                    </Space>
                </div>

                {/* Results Count */}
                {!loading && (
                    <Text type="secondary">
                        {filteredDrugs.length} {filteredDrugs.length === 1 ? 'item' : 'items'}
                        {selectedSection !== 'ALL' && ` in Section ${selectedSection}`}
                    </Text>
                )}

                {/* Loading State */}
                {loading && (
                    <Row gutter={[16, 16]}>
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <Col xs={24} sm={12} md={8} lg={6} key={i}>
                                <Skeleton active />
                            </Col>
                        ))}
                    </Row>
                )}

                {/* Empty State */}
                {!loading && filteredDrugs.length === 0 && (
                    <Empty description="No drugs in this section" />
                )}

                {/* Grid View */}
                {!loading && filteredDrugs.length > 0 && viewMode === 'grid' && (
                    <>
                        <Row gutter={[16, 16]}>
                            {paginatedDrugs.map((drug) => (
                                <Col xs={24} sm={12} md={8} lg={6} key={drug.id}>
                                    <DrugCard drug={drug} onClick={() => handleDrugClick(drug)} />
                                </Col>
                            ))}
                        </Row>
                        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center' }}>
                            <Pagination
                                current={currentPage}
                                total={filteredDrugs.length}
                                pageSize={pageSize}
                                onChange={handlePageChange}
                                onShowSizeChange={handlePageChange}
                                showSizeChanger
                                showTotal={(total) => `Total ${total} items`}
                                pageSizeOptions={['12', '24', '48', '96']}
                            />
                        </div>
                    </>
                )}

                {/* List View */}
                {!loading && filteredDrugs.length > 0 && viewMode === 'list' && (
                    <List
                        grid={{
                            gutter: 16,
                            xs: 1,
                            sm: 1,
                            md: 2,
                            lg: 2,
                            xl: 3,
                            xxl: 3,
                        }}
                        dataSource={filteredDrugs}
                        pagination={{
                            current: currentPage,
                            pageSize: pageSize,
                            total: filteredDrugs.length,
                            onChange: handlePageChange,
                            onShowSizeChange: handlePageChange,
                            showSizeChanger: true,
                            showTotal: (total) => `Total ${total} items`,
                            pageSizeOptions: ['12', '24', '48', '96'],
                        }}
                        renderItem={(drug) => (
                            <List.Item style={{ marginBottom: 0 }}>
                                <div
                                    style={{
                                        cursor: 'pointer',
                                        padding: '12px',
                                        border: '1px solid #f0f0f0',
                                        borderRadius: '8px',
                                        transition: 'all 0.3s',
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                    }}
                                    onClick={() => handleDrugClick(drug)}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = '#1890ff';
                                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = '#f0f0f0';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <Text strong style={{ fontSize: '14px', display: 'block', marginBottom: '8px' }}>
                                                {drug.name}
                                            </Text>
                                            <Space wrap size={[4, 4]} style={{ marginBottom: '8px' }}>
                                                <Tag color={getTypeColor(drug.type)} style={{ margin: 0, fontSize: '11px' }}>
                                                    {drug.type}
                                                </Tag>
                                                {drug.indent_source && (
                                                    <Tag color={getSourceColor(drug.indent_source)} style={{ margin: 0, fontSize: '11px' }}>
                                                        {drug.indent_source}
                                                    </Tag>
                                                )}
                                            </Space>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                                <EnvironmentOutlined style={{ color: '#1890ff', fontSize: '12px' }} />
                                                <Text strong style={{ fontSize: '12px' }}>
                                                    {drug.location_code}
                                                </Text>
                                            </div>
                                            {drug.remarks && (
                                                <Text
                                                    type="secondary"
                                                    style={{
                                                        fontSize: '11px',
                                                        display: 'block',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap'
                                                    }}
                                                    title={drug.remarks}
                                                >
                                                    {drug.remarks}
                                                </Text>
                                            )}
                                        </div>
                                        {drug.image_url && (
                                            <img
                                                width={60}
                                                height={60}
                                                alt={drug.name}
                                                src={drug.image_url}
                                                style={{
                                                    borderRadius: 4,
                                                    objectFit: 'contain',
                                                    backgroundColor: '#f5f5f5',
                                                    flexShrink: 0
                                                }}
                                            />
                                        )}
                                    </div>
                                </div>
                            </List.Item>
                        )}
                    />
                )}
            </Space>

            {/* Indent Modal */}
            <IndentModal
                drug={selectedDrug}
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSuccess={handleIndentSuccess}
            />
        </div>
    );
};

export default IndentPage;
