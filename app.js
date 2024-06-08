let currentId = 0;

const apiUrl = 'http://localhost:3000/students';
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

function calculateTimeToGraduate(birthdate) {
    const birthDate = moment(birthdate, 'DD-MM-YYYY');
    const graduationDate = birthDate.add(22, 'years');
    const currentDate = moment();
    const timeRemaining = graduationDate.diff(currentDate, 'years', true);
    
    return Math.floor(timeRemaining) > 0 ? `${Math.floor(timeRemaining)} năm ra trường` : 'Đã ra trường';
}

function displayOutput(message) {
    const output = document.getElementById('output');
    output.innerHTML = `<pre>${message}</pre>`;
}

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
    return new Promise((resolve, reject) => {
        fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newStudent)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => reject(err));
            }
            return response.json().then(data => resolve(data));
        })
        .then(result => {
            return fetchStudents();
        })
        .catch(error => {
            displayOutput('Error: ' + error.message);
        });
    })
});

document.getElementById('updateStudentForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const studentId = document.getElementById('updateId').value;
    const updatedStudent = {
        name: document.getElementById('updateName').value,
        birthdate: document.getElementById('updateBirthdate').value,
        grades: document.getElementById('updateGrades').value.split(',').map(Number),
        isPayFee: document.getElementById('updateIsPayFee').checked
    };

    fetch(`${apiUrl}/${studentId}`, {
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
        
        await fetchStudents();
    } catch (error) {
        displayOutput('Error: ' + error.message);
    }
});

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

        updateStudentTable(matchedStudents);
    } catch (error) {
        displayOutput('Error: ' + error.message);
    }
});

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
        
        updateStudentTable([topStudent]);
    } catch (error) {
        displayOutput('Error: ' + error.message);
    }
}

async function filterUnpaidStudents() {
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Failed to fetch students');
        }

        const students = await response.json();
        const unpaidStudents = students.filter(student => !student.isPayFee);

        displayOutput('Unpaid fee students: ' + JSON.stringify(unpaidStudents));
        
        updateStudentTable(unpaidStudents);
    } catch (error) {
        displayOutput('Error: ' + error.message);
    }
}

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
        
        updateStudentTable(studentTimes);
    } catch (error) {
        displayOutput('Error: ' + error.message);
    }
}

async function fetchStudents() {
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Failed to fetch students');
        }

        const students = await response.json();
        updateStudentTable(students);

        currentId = students.reduce((maxId, student) => Math.max(maxId, student.id), 0);
    } catch (error) {
        displayOutput('Error: ' + error.message);
    }
}

document.addEventListener('DOMContentLoaded', fetchStudents);
