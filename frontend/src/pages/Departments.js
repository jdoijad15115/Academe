import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, notification } from 'antd';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const Departments = () => {
    const [departments, setDepartments] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDepartment, setEditingDepartment] = useState(null);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            const { data } = await axios.get(`${API_URL}/api/departments`);
            setDepartments(data);
        } catch (error) {
            notification.error({
                message: 'Failed to fetch departments',
                description: error?.response?.data?.message || error.message,
            });
        }
    };

    const handleAddEdit = async () => {
        try {
            const values = await form.validateFields();

            if (editingDepartment) {
                await axios.put(`${API_URL}/api/departments/${editingDepartment.department_id}`, values);
                setDepartments(departments.map(dept =>
                    dept.department_id === editingDepartment.department_id
                        ? { ...dept, ...values }
                        : dept
                ));
                notification.success({ message: 'Department updated successfully' });
            } else {
                const { data } = await axios.post(`${API_URL}/api/departments`, values);
                setDepartments([...departments, data]);
                notification.success({ message: 'Department added successfully' });
            }

            toggleModal(false);
        } catch (error) {
            notification.error({
                message: 'Failed to save department',
                description: error?.response?.data?.message || error.message,
            });
        }
    };

    const handleEdit = (department) => {
        form.setFieldsValue(department);
        setEditingDepartment(department);
        setIsModalOpen(true);
    };

    const handleDelete = async (department_id) => {
        try {
            await axios.delete(`${API_URL}/api/departments/${department_id}`);
            setDepartments(departments.filter(dept => dept.department_id !== department_id));
            notification.success({ message: 'Department deleted successfully' });
        } catch (error) {
            notification.error({
                message: 'Failed to delete department',
                description: error?.response?.data?.message || error.message,
            });
        }
    };

    const toggleModal = (visible) => {
        setIsModalOpen(visible);
        if (!visible) {
            form.resetFields();
            setEditingDepartment(null);
        }
    };

    const columns = [
        { title: 'Department ID', dataIndex: 'department_id', key: 'department_id' },
        { title: 'Department Name', dataIndex: 'department_name', key: 'department_name' },
        { title: 'Head of Department', dataIndex: 'head_of_department', key: 'head_of_department' },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <>
                    <Button onClick={() => handleEdit(record)} style={{ marginRight: 8 }}>Edit</Button>
                    <Button onClick={() => handleDelete(record.department_id)} danger>Delete</Button>
                </>
            ),
        },
    ];

    return (
        <div>
            <h1>Department Management</h1>
            <Button type="primary" onClick={() => toggleModal(true)}>
                Add Department
            </Button>

            <Table
                columns={columns}
                dataSource={departments}
                rowKey="department_id"
                style={{ marginTop: 16 }}
            />

            <Modal
                title={editingDepartment ? "Edit Department" : "Add Department"}
                open={isModalOpen}
                onCancel={() => toggleModal(false)}
                onOk={handleAddEdit}
                okText={editingDepartment ? "Update" : "Add"}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="department_id"
                        label="Department ID"
                        rules={[{ required: true, message: "Please enter a unique department ID" }]}
                    >
                        <Input disabled={!!editingDepartment} />
                    </Form.Item>

                    <Form.Item
                        name="department_name"
                        label="Department Name"
                        rules={[{ required: true, message: "Please enter the department name" }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="head_of_department"
                        label="Head of Department"
                        rules={[{ required: true, message: "Please enter the name of the head of department" }]}
                    >
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Departments;
