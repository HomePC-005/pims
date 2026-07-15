import React, { useState } from 'react';
import { Modal, Form, Input, Button, message, Select, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { supabase } from '../../lib/supabase';

const IPDItemAddModal = ({ visible, onClose, onSuccess }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (values) => {
        try {
            setLoading(true);
            const { error } = await supabase
                .from('inventory_ipd')
                .insert([
                    {
                        name: values.name,
                        section: values.section,
                        row: values.row,
                        bin_size: values.bin_size,
                        bin_loc: values.bin_loc,
                        remarks: values.remarks,
                        image_url: values.image_url,
                    }
                ]);

            if (error) throw error;

            message.success('Item added successfully');
            form.resetFields();
            onSuccess(); // refresh list
            onClose();
        } catch (error) {
            console.error('Error adding item:', error);
            message.error(error.message || 'Failed to add item');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Add New IPD Item"
            open={visible}
            onCancel={onClose}
            footer={null}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
            >
                <Form.Item
                    name="name"
                    label="Item Name"
                    rules={[{ required: true, message: 'Please enter item name' }]}
                >
                    <Input placeholder="Enter item name" />
                </Form.Item>

                <Form.Item
                    name="section"
                    label="Section"
                    rules={[{ required: true, message: 'Please enter section' }]}
                >
                    <Input placeholder="e.g. A" />
                </Form.Item>

                <Form.Item
                    name="row"
                    label="Row"
                    rules={[{ required: true, message: 'Please enter row' }]}
                >
                    <Input placeholder="e.g. 1" />
                </Form.Item>

                <Form.Item
                    name="bin_size"
                    label="Bin Size"
                    rules={[{ required: true, message: 'Please enter bin size' }]}
                >
                    <Input placeholder="e.g. L" />
                </Form.Item>

                <Form.Item
                    name="bin_loc"
                    label="Bin Location"
                    rules={[{ required: true, message: 'Please enter bin location' }]}
                >
                    <Input placeholder="e.g. 1" />
                </Form.Item>

                <Form.Item
                    name="remarks"
                    label="Remarks"
                >
                    <Input.TextArea placeholder="Any remarks" />
                </Form.Item>

                <Form.Item
                    name="image_url"
                    label="Image URL"
                >
                    <Input placeholder="Optional image URL" />
                </Form.Item>

                <Form.Item style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
                    <Button onClick={onClose} style={{ marginRight: 8 }}>
                        Cancel
                    </Button>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        Add Item
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default IPDItemAddModal;
