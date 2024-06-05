const moment = require('moment');
const readline = require('readline')

class Student {
    constructor(name, birthdate, grades) {
        this.name = name;
        this.birthdate = birthdate;
        this.grades = grades;
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

const createStudent = (name, birthdate, grades) => new Student(name, birthdate, grades);

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
    return createStudent(name, birthdate, grades);
}

const printStudentInfo = async () => {
    const numberOfStudent = await askQuestion("nhập số lượng hs: ")
    let students = []
    for (let i = 0; i < numberOfStudent; i++) {
        console.log(`Nhập thông tin cho học sinh thứ ${i + 1}:`);
        const student = await getStudentInfo();
        students.push(student);
    }

    // const combineGrades = students.map(student => [...student.grades])
    // console.log(`Điểm số kết hợp: ${combineGrades.join(', ')}`);

    // const averageGrades = students.map(student => student.calculateAverage());
    // console.log(`Điểm trung bình của các học sinh: ${averageGrades.join(', ')}`);

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
        console.log('10. Thoát');
        console.log('-----');
        action = await askQuestion('Lựa chọn của bạn: ');
        switch (action) {
            case '1':
                console.log('\nDanh sách học sinh:');
                students.map(student => {
                    const age = student.calculateAge()
                    console.log(`
                    Tên: ${student.name}
                    Ngày sinh: ${student.birthdate}
                    Điểm: ${student.grades.join(', ')}
                    Tuổi: ${age}`)
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
