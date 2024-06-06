const moment = require('moment');
const readline = require('readline')

class Student {
    constructor(name, birthdate, grades, isPayFee) {
        this.name = name;
        this.birthdate = birthdate;
        this.grades = grades;
        this.isPayFee = isPayFee;
    }

    calculateAge() {
        return moment(this.birthdate, 'DD-MM-YYYY').diff(moment(), 'years') * -1;
    }

    calculateAverage() {
        return this.grades.reduce((sum, grade) => sum + grade, 0) / this.grades.length;
    }

    formatBirthdate() {
        return moment(this.birthdate).format('DD-MM-YYYY');
    }
}

const createStudent = (name, birthdate, grades, isPayFee) => new Student(name, birthdate, grades, isPayFee);

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const askQuestion = (question) => {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
};

const getStudentInfo = async () => {
    const name = await askQuestion("Nhập tên hs: ")
    const birthdateInput = await askQuestion("Nhập tên ngày sinh (YYYY-MM-DD): ")
    const birthdate = moment(birthdateInput).format('DD-MM-YYYY');
    const gradesInput = await askQuestion("Nhập điểm số cách nhau bởi dấu phẩy: ")
    const grades = gradesInput.split(',').map(Number);
    const isPayFeeInput = await askQuestion('Học sinh đã đóng học phí chưa? (yes/no): ');
    const isPayFee = isPayFeeInput.toLowerCase().trim() === 'yes';
    return createStudent(name, birthdate, grades, isPayFee);
}

const printStudentInfo = async () => {
    const numberOfStudent = await askQuestion("nhập số lượng hs: ")
    let students = []
    for (let i = 0; i < numberOfStudent; i++) {
        console.log(`Nhập thông tin cho học sinh thứ ${i + 1}:`);
        const student = await getStudentInfo();
        students.push(student);
    }



    let action;
    do {
        console.log('\nChọn một hành động:');
        console.log('1. Hiển thị danh sách học sinh');
        console.log('2. Tìm kiếm học sinh:');
        console.log('3. Tìm các học sinh có điểm trung bình trên 80:');
        console.log('4. Tìm học sinh có điểm trung bình cao nhất: ')
        console.log('5. Thêm học sinh mới: ')
        console.log('6. Xóa học sinh');
        console.log('7. Sắp xếp danh sách học sinh theo điểm từ cao xuống thấp: ')
        console.log('8. Sửa thông tin học sinh: ')
        console.log('10. Thoát');
        console.log('-----');
        action = await askQuestion('Lựa chọn của bạn: ');
        switch (action) {
            case '1':
                console.log('\nDanh sách học sinh:');
                students.map(student => {
                    const age = student.calculateAge()
                    student.isPayFee ? console.log('Đã đóng học phí') : console.log('Chưa đóng học phí')
                    console.log('----')
                })
                break;
            case '2':
                const findName = await askQuestion("Nhập tên cần kiểm tra: ");
                const regex = new RegExp(findName, 'i')
                const matchingStudents = students.filter(student => regex.test(student.name));

                if (matchingStudents.length > 0) {
                    console.log(`Những học sinh có tên là ${findName}:`);
                    matchingStudents.forEach(student => {
                        console.log(`Tên: ${student.name}`);
                        console.log(`Ngày sinh: ${student.birthdate}`);
                        console.log(`Tuổi: ${student.calculateAge()}`);
                        console.log(`Điểm số: ${student.grades.join(', ')}`);
                        student.isPayFee ? console.log(`Đã đóng học phí`) : console.log(`Chưa đóng học phí`)
                        console.log('---');
                    });
                } else {
                    console.log(`Không có học sinh nào có tên là ${findName}.`);
                }
                break;
            case '3':
                const highAchievers = students.filter(student => student.calculateAverage() >= 80);
                console.log('Học sinh có điểm trung bình trên 80:');
                highAchievers.forEach(student => {
                    console.log(`Tên: ${student.name}`);
                    console.log(`Ngày sinh: ${student.birthdate}`);
                    console.log(`Tuổi: ${student.calculateAge()}`);
                    console.log(`Điểm số: ${student.grades.join(', ')}`);
                    console.log('---');
                });
                break;
            case '4':
                const topStudent = students.reduce((top, student) => {
                    return (top.calculateAverage() > student.calculateAverage()) ? top : student;
                });
                console.log(topStudent.name)
                break;
            case '5':
                console.log('Nhập thông tin học sinh mới:');
                const newStudent = await getStudentInfo();
                students.push(newStudent);
                console.log('Học sinh mới đã được thêm.');
                break;
            case '6':
                const nameToDelete = await askQuestion('Nhập tên học sinh bạn muốn xóa: ');
                const indexToDelete = students.findIndex(student => student.name === nameToDelete);
                if (indexToDelete !== -1) {
                    students.splice(indexToDelete, 1);
                    console.log(`Học sinh có tên "${nameToDelete}" đã bị xóa.`);
                } else {
                    console.log(`Không tìm thấy học sinh có tên "${nameToDelete}".`);
                }
                break;
            case '7':
                students.sort((a, b) => b.calculateAverage() - a.calculateAverage());
                console.log('Danh sách học sinh đã được sắp xếp theo điểm số trung bình (cao xuống thấp).');
                break;
            case '8':
                const nameToEdit = await askQuestion('Nhập tên học sinh bạn muốn sửa: ');
                const indexToEdit = students.findIndex(student => student.name === nameToEdit);
                if (indexToEdit !== -1) {
                    console.log(`Nhập thông tin mới cho học sinh có tên "${nameToEdit}":`);
                    const updatedStudent = await getStudentInfo(students[indexToEdit]);
                    students[indexToEdit] = updatedStudent;
                    console.log(`Thông tin học sinh có tên "${nameToEdit}" đã được cập nhật.`);
                } else {
                    console.log(`Không tìm thấy học sinh có tên "${nameToEdit}".`);
                }
                break;
            case '10':
                console.log('Thoát chương trình.');
                break;
            default:
                console.log('Lựa chọn không hợp lệ. Vui lòng chọn lại.');
                break;
        }
    } while (action !== '10');
    rl.close();
};
printStudentInfo()
