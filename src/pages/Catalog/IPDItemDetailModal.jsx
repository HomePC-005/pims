import React, { useState, useEffect } from 'react';
import { Modal, Descriptions, Tag, Typography, Space, Image, Form, Input, Button, message, Popconfirm } from 'antd';
import { EnvironmentOutlined, EditOutlined, DeleteOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import { supabase } from '../../lib/supabase';

const { Title, Text } = Typography;

const IPDItemDetailModal = ({ drug, visible, onClose, onSuccess }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        if (drug && visible) {
            form.setFieldsValue({
                name: drug.name,
                section: drug.section,
                row: drug.row,
                bin_size: drug.bin_size,
                bin_loc: drug.bin_loc,
                remarks: drug.remarks,
                image_url: drug.image_url
            });
            setIsEditing(false);
        }
    }, [drug, visible, form]);

    if (!drug) return null;

    const handleUpdate = async (values) => {
        try {
            setLoading(true);
            const { error } = await supabase
                .from('inventory_ipd')
                .update({
                    name: values.name,
                    section: values.section,
                    row: values.row,
                    bin_size: values.bin_size,
                    bin_loc: values.bin_loc,
                    remarks: values.remarks,
                    image_url: values.image_url,
                })
                .eq('id', drug.id);

            if (error) throw error;

            message.success('Item updated successfully');
            setIsEditing(false);
            onSuccess(); // refresh parent
        } catch (error) {
            console.error('Error updating item:', error);
            message.error(error.message || 'Failed to update item');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            setLoading(true);
            const { error } = await supabase
                .from('inventory_ipd')
                .delete()
                .eq('id', drug.id);

            if (error) throw error;

            message.success('Item deleted successfully');
            onSuccess(); // refresh parent
            onClose();
        } catch (error) {
            console.error('Error deleting item:', error);
            message.error(error.message || 'Failed to delete item');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            open={visible}
            onCancel={() => {
                setIsEditing(false);
                onClose();
            }}
            footer={null}
            width={600}
            centered
            title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: 24 }}>
                    <span>{isEditing ? 'Edit Item' : 'Item Details'}</span>
                    {!isEditing && (
                        <Space>
                            <Button icon={<EditOutlined />} onClick={() => setIsEditing(true)}>
                                Edit
                            </Button>
                            <Popconfirm
                                title="Delete this item?"
                                description="Are you sure you want to delete this item?"
                                onConfirm={handleDelete}
                                okText="Yes"
                                cancelText="No"
                                placement="bottomRight"
                            >
                                <Button danger icon={<DeleteOutlined />} loading={loading}>
                                    Delete
                                </Button>
                            </Popconfirm>
                        </Space>
                    )}
                </div>
            }
        >
            {isEditing ? (
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleUpdate}
                    style={{ marginTop: 16 }}
                >
                    <Form.Item
                        name="name"
                        label="Item Name"
                        rules={[{ required: true, message: 'Please enter item name' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="section"
                        label="Section"
                        rules={[{ required: true, message: 'Please enter section' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="row"
                        label="Row"
                        rules={[{ required: true, message: 'Please enter row' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="bin_size"
                        label="Bin Size"
                        rules={[{ required: true, message: 'Please enter bin size' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="bin_loc"
                        label="Bin Location"
                        rules={[{ required: true, message: 'Please enter bin location' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item name="remarks" label="Remarks">
                        <Input.TextArea />
                    </Form.Item>
                    <Form.Item name="image_url" label="Image URL">
                        <Input />
                    </Form.Item>

                    <Form.Item style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24, marginBottom: 0 }}>
                        <Button icon={<CloseOutlined />} onClick={() => setIsEditing(false)} style={{ marginRight: 8 }}>
                            Cancel
                        </Button>
                        <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
                            Save Changes
                        </Button>
                    </Form.Item>
                </Form>
            ) : (
                <Space direction="vertical" size="large" style={{ width: '100%', marginTop: 16 }}>
                    <div style={{ textAlign: 'center' }}>
                        <Title level={3} style={{ marginBottom: 8 }}>{drug.name}</Title>
                        <Space>
                            {drug.section && <Tag color="blue">Sec: {drug.section}</Tag>}
                            {drug.row && <Tag color="cyan">Row: {drug.row}</Tag>}
                        </Space>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                        {drug.image_url ? (
                            <Image
                                src={drug.image_url}
                                alt={drug.name}
                                style={{ maxHeight: 300, borderRadius: 8 }}
                                fallback="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect width='200' height='200' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='48' fill='%23999'%3E%3C/text%3E%3C/svg%3E"
                            />
                        ) : (
                            <div
                                style={{
                                    height: 200,
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontSize: '48px',
                                    fontWeight: 'bold',
                                    borderRadius: 8,
                                }}
                            >
                                {drug.location_code || `${drug.section}-${drug.row}-${drug.bin_size}${drug.bin_loc}`}
                            </div>
                        )}
                    </div>

                    <Descriptions bordered column={1}>
                        <Descriptions.Item label={<><EnvironmentOutlined /> Location Code</>}>
                            <Text strong style={{ fontSize: '16px' }}>{drug.location_code || `${drug.section}-${drug.row}-${drug.bin_size}${drug.bin_loc}`}</Text>
                        </Descriptions.Item>

                        {drug.remarks && (
                            <Descriptions.Item label="Remarks">
                                <Text>{drug.remarks}</Text>
                            </Descriptions.Item>
                        )}
                    </Descriptions>
                </Space>
            )}
        </Modal>
    );
};

export default IPDItemDetailModal;
