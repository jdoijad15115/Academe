import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input } from 'antd';
import axios from 'axios';

const Alumni = () => {
    const [alumni, setAlumni] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAlumnus, setEditingAlumnus] = useState(null);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchAlumni();
    }, []);

    const fetchAlumni = async () => {
        try {
            const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/alumni`);
            setAlumni(data);
        } catch (error) {
            console.error("Error fetching alumni:", error);
            alert("Error fetching alumni data. Check console for details.");
        }
    };

    const handleAddEdit = async () => {
        try {
            const values = await form.validateFields();

            if (editingAlumnus) {
                // Update existing alumnus
                await axios.put(`${process.env.REACT_APP_API_URL}/api/alumni/${editingAlumnus.alumni_id}`, values);
                setAlumni(prev =>
                    prev.map(alum => alum.alumni_id === editingAlumnus.alumni_id ? { ...alum, ...values } : alum)
                );
            } else {
                // Add new alumnus
                const { data } = await axios.post(`${process.env.REACT_APP_API_URL}/api/alumni`, values);
                setAlumni(prev => [...prev, data]);
            }

            setIsModalOpen(false);
            form.resetFields();
            setEditingAlumnus(null);
        } catch (error) {
            console.error("Error saving alumnus:", error);
            alert("Could not save alumnus. Check console for details.");
        }
    };

    const handleEdit = (record) => {
        form.setFieldsValue(record);
        setEditingAlumnus(record);
        setIsModalOpen(true);
    };

    const handleDelete = async (alumni_id) => {
        try {
            await axios.delete(`${process.env.REACT_APP_API_URL}/api/alumni/${alumni_id}`);
            setAlumni(prev => prev.filter(alum => alum.alumni_id !== alumni_id));
        } catch (error) {
            console.error("Error deleting alumnus:", error);
            alert("Could not delete alumnus. Check console for details.");
        }
    };

    const columns = [
        { title: 'Alumni ID', dataIndex: 'alumni_id', key: 'alumni_id' },
        { title: 'Student ID', dataIndex: 'student_id', key: 'student_id' },
        { title: 'Graduation Year', dataIndex: 'graduation_year', key: 'graduation_year' },
        { title: 'Job Title', dataIndex: 'current_job_title', key: 'current_job_title' },
        { title: 'Company', dataIndex: 'company', key: 'company' },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <>
                    <Button type="link" onClick={() => handleEdit(record)}>Edit</Button>
                    <Button type="link" danger onClick={() => handleDelete(record.alumni_id)}>Delete</Button>
                </>
            ),
        },
    ];

    return (
        <div>
            <h1>Alumni Management</h1>
            <Button type="primary" onClick={() => { setIsModalOpen(true); setEditingAlumnus(null); }}>
                Add Alumni
            </Button>
            <Table columns={columns} dataSource={alumni} rowKey="alumni_id" />

            <Modal
                title={editingAlumnus ? "Edit Alumni" : "Add Alumni"}
                open={isModalOpen}
                onCancel={() => {
                    setIsModalOpen(false);
                    form.resetFields();
                    setEditingAlumnus(null);
                }}
                onOk={handleAddEdit}
                okText={editingAlumnus ? "Update" : "Add"}
            >
                <Form form={form} layout="vertical" initialValues={{}}>
                    <Form.Item
                        name="alumni_id"
                        label="Alumni ID"
                        rules={[{ required: true, message: "Please enter Alumni ID" }]}
                    >
                        <Input disabled={!!editingAlumnus} />
                    </Form.Item>
                    <Form.Item
                        name="student_id"
                        label="Student ID"
                        rules={[{ required: true, message: "Please enter Student ID" }]}
                    >
                        <Input disabled={!!editingAlumnus} />
                    </Form.Item>
                    <Form.Item
                        name="graduation_year"
                        label="Graduation Year"
                        rules={[{ required: true, message: "Please enter Graduation Year" }]}
                    >
                        <Input type="number" />
                    </Form.Item>
                    <Form.Item
                        name="current_job_title"
                        label="Job Title"
                        rules={[{ required: true, message: "Please enter Job Title" }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="company"
                        label="Company"
                        rules={[{ required: true, message: "Please enter Company Name" }]}
                    >
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Alumni;
