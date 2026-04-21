import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, DatePicker, Select, notification } from 'antd';
import axios from 'axios';
import moment from 'moment';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const Attendance = () => {
    const [attendance, setAttendance] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAttendance, setEditingAttendance] = useState(null);
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchAttendance();
        fetchStudents();
        fetchCourses();
    }, []);

    const fetchAttendance = async () => {
        try {
            const { data } = await axios.get(`${API_URL}/api/attendance`);
            console.log("Fetched attendance:", data);
            setAttendance(data);
        } catch (error) {
            notification.error({
                message: 'Failed to fetch attendance',
                description: error?.response?.data?.message || error.message,
            });
        }
    };

    const fetchStudents = async () => {
        try {
            const { data } = await axios.get(`${API_URL}/api/students`);
            console.log("Fetched students:", data);
            setStudents(data);
        } catch (error) {
            notification.error({
                message: 'Failed to fetch students',
                description: error?.response?.data?.message || error.message,
            });
        }
    };

    const fetchCourses = async () => {
        try {
            const { data } = await axios.get(`${API_URL}/api/courses`);
            console.log("Fetched courses:", data);
            setCourses(data);
        } catch (error) {
            notification.error({
                message: 'Failed to fetch courses',
                description: error?.response?.data?.message || error.message,
            });
        }
    };

    const handleAddEdit = async () => {
        try {
            const values = await form.validateFields();
            values.attendance_date = values.attendance_date.format('YYYY-MM-DD');

            if (editingAttendance) {
                await axios.put(`${API_URL}/api/attendance/${editingAttendance.attendance_id}`, values);
                setAttendance(attendance.map(att =>
                    att.attendance_id === editingAttendance.attendance_id ? { ...att, ...values } : att
                ));
                notification.success({ message: 'Attendance updated successfully' });
            } else {
                const { data } = await axios.post(`${API_URL}/api/attendance`, values);
                setAttendance([...attendance, { ...values, attendance_id: data.attendanceId }]);
                notification.success({ message: 'Attendance added successfully' });
            }

            toggleModal(false);
        } catch (error) {
            notification.error({
                message: 'Failed to save attendance',
                description: error?.response?.data?.message || error.message,
            });
        }
    };

    const handleEdit = (record) => {
        form.setFieldsValue({
            ...record,
            attendance_date: moment(record.attendance_date),
        });
        setEditingAttendance(record);
        setIsModalOpen(true);
    };

    const handleDelete = async (attendance_id) => {
        try {
            await axios.delete(`${API_URL}/api/attendance/${attendance_id}`);
            setAttendance(attendance.filter(att => att.attendance_id !== attendance_id));
            notification.success({ message: 'Attendance deleted successfully' });
        } catch (error) {
            notification.error({
                message: 'Failed to delete attendance',
                description: error?.response?.data?.message || error.message,
            });
        }
    };

    const toggleModal = (visible) => {
        setIsModalOpen(visible);
        if (!visible) {
            form.resetFields();
            setEditingAttendance(null);
        }
    };

    const columns = [
        { title: 'Attendance ID', dataIndex: 'attendance_id', key: 'attendance_id' },
        {
    title: 'Student',
    key: 'student_name',
    render: (_, record) => {
        const student = students.find(s => s.student_id === record.student_id);
        return student ? student.name : record.student_id;
    }
},

        {
            title: 'Course',
            key: 'course_name',
            render: (_, record) => {
                const course = courses.find(c => c.course_id === record.course_id);
                return course ? course.course_name : record.course_id;
            }
        },
        {
            title: 'Date',
            dataIndex: 'attendance_date',
            key: 'attendance_date',
            render: date => moment(date).format('YYYY-MM-DD'),
        },
        { title: 'Status', dataIndex: 'status', key: 'status' },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <>
                    <Button onClick={() => handleEdit(record)} style={{ marginRight: 8 }}>Edit</Button>
                    <Button onClick={() => handleDelete(record.attendance_id)} danger>Delete</Button>
                </>
            ),
        },
    ];

    return (
        <div>
            <h1>Attendance Management</h1>
            <Button type="primary" onClick={() => toggleModal(true)}>
                Add Attendance
            </Button>

            <Table
                columns={columns}
                dataSource={attendance}
                rowKey="attendance_id"
                style={{ marginTop: 16 }}
            />

            <Modal
                title={editingAttendance ? "Edit Attendance" : "Add Attendance"}
                open={isModalOpen}
                onCancel={() => toggleModal(false)}
                onOk={handleAddEdit}
                okText={editingAttendance ? "Update" : "Add"}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="student_id"
                        label="Student"
                        rules={[{ required: true, message: "Please select a student" }]}
                    >
                        <Select placeholder="Select a student" disabled={!!editingAttendance}>
                            {students.map((s) => (
                                <Select.Option key={s.student_id} value={s.student_id}>
                                    {s.student_id} - {(s.first_name || '') + ' ' + (s.last_name || '')}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="course_id"
                        label="Course"
                        rules={[{ required: true, message: "Please select a course" }]}
                    >
                        <Select placeholder="Select a course" disabled={!!editingAttendance}>
                            {courses.map((c) => (
                                <Select.Option key={c.course_id} value={c.course_id}>
                                    {c.course_id} - {c.course_name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="attendance_date"
                        label="Date"
                        rules={[{ required: true, message: "Please select the date" }]}
                    >
                        <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                        name="status"
                        label="Status"
                        rules={[{ required: true, message: "Please select attendance status" }]}
                    >
                        <Select placeholder="Select status">
                            <Select.Option value="Present">Present</Select.Option>
                            <Select.Option value="Absent">Absent</Select.Option>
                            <Select.Option value="Late">Late</Select.Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Attendance;
