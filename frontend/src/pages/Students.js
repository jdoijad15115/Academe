import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, DatePicker, InputNumber } from 'antd';
import axios from 'axios';
import moment from 'moment';

const API_URL = process.env.REACT_APP_API_URL; //  use env variable

const Students = () => {
    const [students, setStudents] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
    try {
        console.log("Fetching students...");
        const response = await axios.get(`${API_URL}/api/students`);
        console.log(" Students fetched successfully:", response.data);
        setStudents(response.data);
    } catch (error) {
        console.error("Error fetching students:");
        if (error.response) {
            // Server responded with a status other than 2xx
            console.error("Status:", error.response.status);
            console.error("Data:", error.response.data);
            console.error("Headers:", error.response.headers);
        } else if (error.request) {
            // Request was made but no response
            console.error("No response received:", error.request);
        } else {
            // Something else triggered the error
            console.error("Error message:", error.message);
        }
        alert("Error fetching students. Check console for full error log.");
    }
};

    const columns = [
        { title: 'Student ID', dataIndex: 'student_id', key: 'student_id' },
        { title: 'Name', dataIndex: 'name', key: 'name' },
        { 
            title: 'Date of Birth', 
            dataIndex: 'date_of_birth', 
            key: 'date_of_birth', 
            render: date => moment(date).format('YYYY-MM-DD') 
        },
        { title: 'Email', dataIndex: 'email', key: 'email' },
        { title: 'Phone Number', dataIndex: 'phone_number', key: 'phone_number' },
        { title: 'Admission Year', dataIndex: 'admission_year', key: 'admission_year' },
        { title: 'Department ID', dataIndex: 'department_id', key: 'department_id' },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <>
                    <Button onClick={() => handleEdit(record)}>Edit</Button>
                    <Button onClick={() => handleDelete(record.student_id)} danger>Delete</Button>
                </>
            ),
        },
    ];

    const handleAddEdit = async () => {
        try {
            const values = await form.validateFields();
            if (values.date_of_birth) {
                values.date_of_birth = values.date_of_birth.format('YYYY-MM-DD');
            }

            if (editingStudent) {
                const response = await axios.put(`${API_URL}/api/students/${editingStudent.student_id}`, values);
                setStudents(students.map(student =>
                    student.student_id === editingStudent.student_id ? { ...student, ...values } : student
                ));
                console.log("Updated student:", response.data);
            } else {
                const response = await axios.post(`${API_URL}/api/students`, values);
                setStudents([...students, response.data]);
                console.log("New student added:", response.data);
            }

            setIsModalOpen(false);
            form.resetFields();
            setEditingStudent(null);
        } catch (error) {
            console.error("Failed to add/edit student:", error);
            alert("Error: Could not save student data. Check console for details.");
        }
    };

    const handleEdit = (student) => {
        form.setFieldsValue({
            ...student,
            date_of_birth: moment(student.date_of_birth)
        });
        setEditingStudent(student);
        setIsModalOpen(true);
    };

    const handleDelete = async (student_id) => {
        try {
            await axios.delete(`${API_URL}/api/students/${student_id}`);
            setStudents(students.filter(student => student.student_id !== student_id));
            console.log("Student deleted successfully");
        } catch (error) {
            console.error("Failed to delete student:", error);
            alert("Error: Could not delete student. Check console for details.");
        }
    };

    const toggleModal = (visible) => {
        setIsModalOpen(visible);
        if (!visible) {
            form.resetFields();
            setEditingStudent(null);
        }
    };

    return (
        <div>
            <h1>Student Management</h1>
            <Button type="primary" onClick={() => { setIsModalOpen(true); setEditingStudent(null); }}>
                Add Student
            </Button>
            <Table columns={columns} dataSource={students} rowKey="student_id" />

            <Modal
                title={editingStudent ? "Edit Student" : "Add Student"}
                open={isModalOpen}
                onCancel={() => toggleModal(false)}
                onOk={handleAddEdit}
            >
                <Form form={form} layout="vertical">
                    <Form.Item 
                        name="student_id"
                        label="Student ID"
                        rules={[{ required: true, message: "Please enter a unique student ID" }]} >
                        <Input disabled={!!editingStudent} />
                    </Form.Item>
                    <Form.Item 
                        name="name" 
                        label="Name" 
                        rules={[{ required: true, message: "Please enter the student's name" }]} >
                        <Input />
                    </Form.Item>
                    <Form.Item 
                        name="date_of_birth" 
                        label="Date of Birth" 
                        rules={[{ required: true, message: "Please enter the date of birth" }]} >
                        <DatePicker format="YYYY-MM-DD" />
                    </Form.Item>
                    <Form.Item 
                        name="email" 
                        label="Email" 
                        rules={[{ required: true, type: 'email', message: "Please enter a valid email" }]} >
                        <Input />
                    </Form.Item>
                    <Form.Item 
                        name="phone_number" 
                        label="Phone Number" 
                        rules={[{ required: true, message: "Please enter the phone number" }]} >
                        <Input />
                    </Form.Item>
                    <Form.Item 
                        name="admission_year" 
                        label="Admission Year" 
                        rules={[{ required: true, message: "Please enter the admission year" }]} >
                        <InputNumber min={1900} max={2100} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item 
                        name="department_id" 
                        label="Department ID" 
                        rules={[{ required: true, message: "Please enter the department ID" }]} >
                        <InputNumber min={1} style={{ width: '100%' }} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Students;
