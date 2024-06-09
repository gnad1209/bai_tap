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

        // Thêm sự kiện click vào mỗi hàng
        row.addEventListener('click', () => {
            document.getElementById('updateId').value = student.id;
            document.getElementById('deleteId').value = student.id;
            document.getElementById('updateName').value = student.name;
            document.getElementById('updateBirthdate').value = student.birthdate;
            document.getElementById('updateGrades').value = student.grades.join(', ');
            document.getElementById('updateIsPayFee').checked = student.isPayFee;
        });
    });
}

// Hàm xác thực tên
function validateName(name) {
    const nameRegex = /^[A-Za-z\s]+$/;
    return nameRegex.test(name);
}

// Hàm xác thực điểm số
function validateGrades(grades) {
    return grades.length <= 3;
}

function validateBirthdate(birthdate) {
    const birthDate = moment(birthdate, 'DD-MM-YYYY');
    const currentDate = moment();
    return birthDate.isBefore(currentDate);
}

// Hàm tính thời gian còn lại để ra trường
function calculateTimeToGraduate(birthdate) {
    const birthDate = moment(birthdate, 'DD-MM-YYYY');
    const graduationDate = birthDate.add(22, 'years');
    const currentDate = moment();
    const timeRemaining = graduationDate.diff(currentDate, 'years', true);

    return Math.floor(timeRemaining) > 0 ? `${Math.floor(timeRemaining)} năm` : 'Graduated';
}

// Cập nhật hiển thị kết quả
function displayOutput(message) {
    const output = document.getElementById('output');
    output.innerHTML = `<pre>${message}</pre>`;
}

// Hàm để thực hiện yêu cầu API
function apiRequest(url, options) {
    return new Promise((resolve, reject) => {
        fetch(url, options)
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => reject(err));
                }
                return response.json().then(data => resolve(data));
            })
            .catch(error => reject(error));
    });
}

// Hàm để lấy danh sách học sinh từ API và cập nhật bảng
function fetchStudents() {
    return apiRequest(apiUrl)
        .then(students => {
            updateStudentTable(students);
            currentId = students.reduce((maxId, student) => Math.max(maxId, student.id), 0);
        })
        .catch(error => displayOutput('Error: ' + error.message));
}

// Hàm thêm học sinh
document.getElementById('addStudentForm').addEventListener('submit', (e) => {
    e.preventDefault();

    currentId += 1;
    
    const newStudent = {
        id: currentId.toString(),
        name: document.getElementById('addName').value,
        birthdate: document.getElementById('addBirthdate').value,
        grades: document.getElementById('addGrades').value.split(',').map(Number),
        isPayFee: document.getElementById('addIsPayFee').checked
    };
    // if (!validateName(newStudent.name)) {
    //     displayOutput('tên ko có số và ký tự đặc biệt.');
    //     return;
    // }

    if (!validateGrades(newStudent.grades)) {
        displayOutput('nhập tối đa 3 điểm');
        return;
    }
    if (!validateBirthdate(newStudent.birthdate)) {
        displayOutput('ngày sinh phải nhỏ hơn ngày hiện tại.');
        return;
    }
    apiRequest(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newStudent)
    })
    .then(result => {
        displayOutput('Student added: ' + JSON.stringify(result));
        return fetchStudents();
    })
    .catch(error => displayOutput('Error: ' + error.message));
});

// Hàm cập nhật học sinh
document.getElementById('updateStudentForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const studentId = document.getElementById('updateId').value;
    const updatedStudent = {
        name: document.getElementById('updateName').value,
        birthdate: document.getElementById('updateBirthdate').value,
        grades: document.getElementById('updateGrades').value.split(',').map(Number),
        isPayFee: document.getElementById('updateIsPayFee').checked
    };

    apiRequest(`${apiUrl}/${studentId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedStudent)
    })
    .then(result => {
        displayOutput('Student updated: ' + JSON.stringify(result));
        return fetchStudents();
    })
    .catch(error => displayOutput('Error: ' + error.message));
});

// Hàm xóa học sinh
document.getElementById('deleteStudentForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const studentId = document.getElementById('deleteId').value;

    apiRequest(`${apiUrl}/${studentId}`, {
        method: 'DELETE'
    })
    .then(() => {
        displayOutput('Student deleted');
        return fetchStudents();
    })
    .catch(error => displayOutput('Error: ' + error.message));
});

// Hàm tìm kiếm học sinh
document.getElementById('searchStudentForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const searchName = document.getElementById('searchName').value;

    apiRequest(apiUrl)
    .then(students => {
        const matchedStudents = students.filter(student => new RegExp(searchName, 'i').test(student.name));
        displayOutput('Search results: ' + JSON.stringify(matchedStudents));
        updateStudentTable(matchedStudents);
    })
    .catch(error => displayOutput('Error: ' + error.message));
});

// Hàm lọc học sinh điểm cao nhất
// function filterTopStudents() {
//     return apiRequest(apiUrl)
//         .then(students => {
//             const topStudent = students.reduce((prev, current) => {
//                 const prevAvg = prev.grades.reduce((a, b) => a + b, 0) / prev.grades.length;
//                 const currentAvg = current.grades.reduce((a, b) => a + b, 0) / current.grades.length;
//                 return (prevAvg > currentAvg) ? prev : current;
//             });
//             displayOutput('Top student: ' + JSON.stringify(topStudent));
//         })
//         .catch(error => displayOutput('Error: ' + error.message));
// }
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

        // Cập nhật bảng học sinh
        updateStudentTable([topStudent]);
    } catch (error) {
        displayOutput('Error: ' + error.message);
    }
}
// Hàm lọc học sinh chưa đóng học phí
// function filterUnpaidStudents() {
//     return apiRequest(apiUrl)
//         .then(students => {
//             const unpaidStudents = students.filter(student => !student.isPayFee);
//             displayOutput('Unpaid students: ' + JSON.stringify(unpaidStudents));
//             updateStudentTable(unpaidStudents);
//         })
//         .catch(error => displayOutput('Error: ' + error.message));
// }
async function filterUnpaidStudents() {
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Failed to fetch students');
        }

        const students = await response.json();
        const unpaidStudents = students.filter(student => !student.isPayFee);

        // Cập nhật bảng học sinh
        updateStudentTable(unpaidStudents);
    } catch (error) {
        displayOutput('Error: ' + error.message);
    }
}
// Gọi hàm fetchStudents khi tải trang
fetchStudents();
