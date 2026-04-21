import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, notification } from 'antd';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const Classrooms = () => {
    const [classrooms, setClassrooms] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentClassroom, setCurrentClassroom] = useState(null);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchClassrooms();
    }, []);

    const fetchClassrooms = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/classrooms`);
            setClassrooms(response.data);
        } catch (error) {
            notification.error({
                message: 'Error fetching classrooms',
                description: error?.response?.data?.message || error.message,
            });
        }
    };

    const handleAdd = async () => {
        try {
            const values = await form.validateFields();
            const response = await axios.post(`${API_URL}/api/classrooms`, {
                room_number: values.room_number,
                building: values.building,
                capacity: values.capacity
            });
            setClassrooms([...classrooms, response.data]);
            notification.success({ message: 'Classroom added successfully' });
            closeModalAndReset();
        } catch (error) {
            notification.error({
                message: 'Error adding classroom',
                description: error?.response?.data?.message || error.message,
            });
        }
    };

    const handleEdit = async () => {
        try {
            const values = await form.validateFields();
            await axios.put(`${API_URL}/api/classrooms/${currentClassroom.classroom_id}`, {
                room_number: values.room_number,
                building: values.building,
                capacity: values.capacity
            });
            const updatedList = classrooms.map((classroom) =>
                classroom.classroom_id === currentClassroom.classroom_id
                    ? { ...classroom, ...values }
                    : classroom
            );
            setClassrooms(updatedList);
            notification.success({ message: 'Classroom updated successfully' });
            closeModalAndReset();
        } catch (error) {
            notification.error({
                message: 'Error updating classroom',
                description: error?.response?.data?.message || error.message,
            });
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${API_URL}/api/classrooms/${id}`);
            setClassrooms(classrooms.filter((c) => c.classroom_id !== id));
            notification.success({ message: 'Classroom deleted successfully' });
        } catch (error) {
            notification.error({
                message: 'Error deleting classroom',
                description: error?.response?.data?.message || error.message,
            });
        }
    };

    const openEditModal = (classroom) => {
        setIsEditMode(true);
        setCurrentClassroom(classroom);
        form.setFieldsValue({
            room_number: classroom.room_number,
            building: classroom.building,
            capacity: classroom.capacity,
        });
        setIsModalOpen(true);
    };

    const closeModalAndReset = () => {
        form.resetFields();
        setIsEditMode(false);
        setCurrentClassroom(null);
        setIsModalOpen(false);
    };

    return (
        <div>
            <h1>Classroom Management</h1>
            <Button type="primary" onClick={() => setIsModalOpen(true)}>Add Classroom</Button>
            <Table
                columns={[
                    { title: 'Classroom ID', dataIndex: 'classroom_id', key: 'classroom_id' },
                    { title: 'Room Number', dataIndex: 'room_number', key: 'room_number' },
                    { title: 'Building', dataIndex: 'building', key: 'building' },
                    { title: 'Capacity', dataIndex: 'capacity', key: 'capacity' },
                    {
                        title: 'Actions',
                        key: 'actions',
                        render: (_, record) => (
                            <>
                                <Button onClick={() => openEditModal(record)} style={{ marginRight: 8 }}>Edit</Button>
                                <Button onClick={() => handleDelete(record.classroom_id)} danger>Delete</Button>
                            </>
                        ),
                    },
                ]}
                dataSource={classrooms}
                rowKey="classroom_id"
            />
            <Modal
                title={isEditMode ? "Edit Classroom" : "Add Classroom"}
                open={isModalOpen}
                onCancel={closeModalAndReset}
                onOk={isEditMode ? handleEdit : handleAdd}
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="room_number" label="Room Number" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="building" label="Building" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="capacity" label="Capacity" rules={[{ required: true, type: 'number', min: 1 }]}>
                        <InputNumber style={{ width: '100%' }} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Classrooms;
