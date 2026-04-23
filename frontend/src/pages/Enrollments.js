import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, DatePicker } from 'antd';
import axios from 'axios';
import moment from 'moment';

const API_BASE_URL = process.env.REACT_APP_API_URL;

const Enrollments = () => {
    const [enrollments, setEnrollments] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEnrollment, setEditingEnrollment] = useState(null);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchEnrollments();
    }, []);

    const fetchEnrollments = async () => {
        try {
            console.log("Fetching enrollments...");
            const response = await axios.get(`${API_BASE_URL}/api/enrollments`);
            console.log("Fetched enrollments:", response.data);
            setEnrollments(response.data);
        } catch (error) {
            console.error("Error fetching enrollments:", error);
            alert("Error fetching enrollments. Check console for details.");
        }
    };

    const columns = [
        { title: 'Enrollment ID', dataIndex: 'enrollment_id', key: 'enrollment_id' },
        { title: 'Student ID', dataIndex: 'student_id', key: 'student_id' },
        { title: 'Course ID', dataIndex: 'course_id', key: 'course_id' },
        {
            title: 'Enrollment Date',
            dataIndex: 'enrollment_date',
            key: 'enrollment_date',
            render: date => moment(date).format('YYYY-MM-DD')
        },
        { title: 'Grade', dataIndex: 'grade', key: 'grade' },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <>
                    <Button onClick={() => handleEdit(record)}>Edit</Button>
                    <Button onClick={() => handleDelete(record.enrollment_id)} danger>Delete</Button>
                </>
            ),
        },
    ];

    const handleAddEdit = async () => {
        try {
            const values = await form.validateFields();
            if (values.enrollment_date) {
                values.enrollment_date = values.enrollment_date.format('YYYY-MM-DD');
            }

            if (editingEnrollment) {
                const response = await axios.put(`${API_BASE_URL}/api/enrollments/${editingEnrollment.enrollment_id}`, values);
                setEnrollments(enrollments.map(enrollment =>
                    enrollment.enrollment_id === editingEnrollment.enrollment_id ? { ...enrollment, ...values } : enrollment
                ));
                console.log("Updated enrollment:", response.data);
            } else {
                const response = await axios.post(`${API_BASE_URL}/api/enrollments`, values);
                setEnrollments([...enrollments, response.data]);
                console.log("New enrollment added:", response.data);
            }

            setIsModalOpen(false);
            form.resetFields();
            setEditingEnrollment(null);
        } catch (error) {
            console.error("Failed to add/edit enrollment:", error);
            alert("Error: Could not save enrollment data. Check console for details.");
        }
    };

    const handleEdit = (enrollment) => {
        form.setFieldsValue({
            ...enrollment,
            enrollment_date: moment(enrollment.enrollment_date)
        });
        setEditingEnrollment(enrollment);
        setIsModalOpen(true);
    };

    const handleDelete = async (enrollment_id) => {
        try {
            await axios.delete(`${API_BASE_URL}/api/enrollments/${enrollment_id}`);
            setEnrollments(enrollments.filter(enrollment => enrollment.enrollment_id !== enrollment_id));
            console.log("Enrollment deleted successfully");
        } catch (error) {
            console.error("Failed to delete enrollment:", error);
            alert("Error: Could not delete enrollment. Check console for details.");
        }
    };

    const toggleModal = (visible) => {
        setIsModalOpen(visible);
        if (!visible) {
            form.resetFields();
            setEditingEnrollment(null);
        }
    };

    return (
        <div>
            <h1>Enrollment Management</h1>
            <Button type="primary" onClick={() => { setIsModalOpen(true); setEditingEnrollment(null); }}>
                Add Enrollment
            </Button>
            <Table columns={columns} dataSource={enrollments} rowKey="enrollment_id" />

            <Modal
                title={editingEnrollment ? "Edit Enrollment" : "Add Enrollment"}
                open={isModalOpen}
                onCancel={() => toggleModal(false)}
                onOk={handleAddEdit}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="enrollment_id"
                        label="Enrollment ID"
                        rules={[{ required: true, message: "Please enter a unique enrollment ID" }]}>
                        <Input disabled={!!editingEnrollment} />
                    </Form.Item>
                    <Form.Item
                        name="student_id"
                        label="Student ID"
                        rules={[{ required: true, message: "Please enter the student ID" }]}>
                        <Input disabled={!!editingEnrollment} />
                    </Form.Item>
                    <Form.Item
                        name="course_id"
                        label="Course ID"
                        rules={[{ required: true, message: "Please enter the course ID" }]}>
                        <Input disabled={!!editingEnrollment} />
                    </Form.Item>
                    <Form.Item
                        name="enrollment_date"
                        label="Enrollment Date"
                        rules={[{ required: true, message: "Please enter the enrollment date" }]}>
                        <DatePicker format="YYYY-MM-DD" />
                    </Form.Item>
                    <Form.Item
                        name="grade"
                        label="Grade"
                        rules={[{ required: true, message: "Please enter the grade" }]}>
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Enrollments;
