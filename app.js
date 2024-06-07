let currentId = 0;

// URL của API giả định
const apiUrl = 'http://localhost:3000/students';

// Hàm để cập nhật bảng học sinh
function updateStudentTable(students) {
    const tableBody = document.getElementById('studentTable').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = ''; // Xóa nội dung cũ của bảng

    students.forEach(student => {
        const row = tableBody.insertRow();
        row.insertCell(0).innerText = student.id;
        row.insertCell(1).innerText = student.name;
        row.insertCell(2).innerText = student.birthdate;
        row.insertCell(3).innerText = student.grades.join(', ');
        row.insertCell(4).innerText = student.isPayFee ? 'Yes' : 'No';
        row.insertCell(5).innerText = calculateTimeToGraduate(student.birthdate);
    });
}

// Hàm tính thời gian còn lại để ra trường
function calculateTimeToGraduate(birthdate) {
    const birthDate = moment(birthdate, 'DD-MM-YYYY');
    const graduationDate = birthDate.add(22, 'years');
    const currentDate = moment();
    const timeRemaining = graduationDate.diff(currentDate, 'years', true);

    return timeRemaining > 0 ? `${timeRemaining.toFixed(2)} years` : 'Graduated';
}

// Cập nhật hiển thị kết quả
function displayOutput(message) {
    const output = document.getElementById('output');
    output.innerHTML = `<pre>${message}</pre>`;
}

// Hàm thêm học sinh
document.getElementById('addStudentForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    currentId += 1;
    
    const newStudent = {
        id: currentId,
        name: document.getElementById('addName').value,
        birthdate: document.getElementById('addBirthdate').value,
        grades: document.getElementById('addGrades').value.split(',').map(Number),
        isPayFee: document.getElementById('addIsPayFee').checked
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newStudent)
        });

        if (!response.ok) {
            throw new Error('Failed to add student');
        }

        const result = await response.json();
        displayOutput('Student added: ' + JSON.stringify(result));
        
        // Cập nhật bảng học sinh
        await fetchStudents();
    } catch (error) {
        displayOutput('Error: ' + error.message);
    }
});

// Hàm cập nhật học sinh
document.getElementById('updateStudentForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const studentId = document.getElementById('updateId').value;
    const updatedStudent = {
        name: document.getElementById('updateName').value,
        birthdate: document.getElementById('updateBirthdate').value,
        grades: document.getElementById('updateGrades').value.split(',').map(Number),
        isPayFee: document.getElementById('updateIsPayFee').checked
    };

    try {
        const response = await fetch(`${apiUrl}/${studentId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedStudent)
        });

        if (!response.ok) {
            throw new Error('Failed to update student');
        }

        const result = await response.json();
        displayOutput('Student updated: ' + JSON.stringify(result));
        
        // Cập nhật bảng học sinh
        await fetchStudents();
    } catch (error) {
        displayOutput('Error: ' + error.message);
    }
});

// Hàm xóa học sinh
document.getElementById('deleteStudentForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const studentId = document.getElementById('deleteId').value;

    try {
        const response = await fetch(`${apiUrl}/${studentId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Failed to delete student');
        }

        displayOutput('Student deleted');
        
        // Cập nhật bảng học sinh
        await fetchStudents();
    } catch (error) {
        displayOutput('Error: ' + error.message);
    }
});

// Hàm tìm kiếm học sinh
document.getElementById('searchStudentForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const searchName = document.getElementById('searchName').value;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Failed to fetch students');
        }

        const students = await response.json();
        const matchedStudents = students.filter(student => new RegExp(searchName, 'i').test(student.name));

        displayOutput('Search results: ' + JSON.stringify(matchedStudents));
        
        // Cập nhật bảng học sinh
        updateStudentTable(matchedStudents);
    } catch (error) {
        displayOutput('Error: ' + error.message);
    }
});

// Hàm lọc học sinh có điểm cao nhất
async function filterTopStudent() {
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Failed to fetch students');
        }

        const students = await response.json();
        const topStudent = students.reduce((prev, current) => {
            const prevAvg = prev.grades.reduce((a, b) => a + b, 0) / prev.grades.length;
            const currentAvg = current.grades.reduce((a, b) => a + b, 0) / current.grades.length;
            return (prevAvg > currentAvg) ? prev : current;
        });

        displayOutput('Top student: ' + JSON.stringify(topStudent));
        
        // Cập nhật bảng học sinh
        updateStudentTable([topStudent]);
    } catch (error) {
        displayOutput('Error: ' + error.message);
    }
}

// Hàm lọc học sinh chưa đóng học phí
async function filterUnpaidStudents() {
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Failed to fetch students');
        }

        const students = await response.json();
        const unpaidStudents = students.filter(student => !student.isPayFee);

        displayOutput('Unpaid fee students: ' + JSON.stringify(unpaidStudents));
        
        // Cập nhật bảng học sinh
        updateStudentTable(unpaidStudents);
    } catch (error) {
        displayOutput('Error: ' + error.message);
    }
}

// Hàm hiển thị thời gian còn lại để ra trường cho từng học sinh
async function displayTimeToGraduate() {
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Failed to fetch students');
        }

        const students = await response.json();
        const studentTimes = students.map(student => {
            const timeRemaining = calculateTimeToGraduate(student.birthdate);
            return {
                ...student,
                timeToGraduate: timeRemaining
            };
        });

        displayOutput('Students with time to graduate: ' + JSON.stringify(studentTimes));
        
        // Cập nhật bảng học sinh
        updateStudentTable(studentTimes);
    } catch (error) {
        displayOutput('Error: ' + error.message);
    }
}

// Hàm để lấy danh sách học sinh từ API và cập nhật bảng
async function fetchStudents() {
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Failed to fetch students');
        }

        const students = await response.json();
        updateStudentTable(students);

        // Cập nhật ID hiện tại để không trùng lặp
        currentId = students.reduce((maxId, student) => Math.max(maxId, student.id), 0);
    } catch (error) {
        displayOutput('Error: ' + error.message);
    }
}

// Hiển thị thông tin các học sinh cùng thời gian còn lại để ra trường khi tải trang
document.addEventListener('DOMContentLoaded', fetchStudents);
