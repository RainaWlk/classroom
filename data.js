
//definition
class Course {

	constructor(name, teacher) {
		this.name = name;
		this.teacher = teacher;
		this.students = [];
	}
}


class Student {
	constructor(name){
		this.name = name;
		this.attendDates = [];
	}
}


exports.Course = Course;
exports.Student = Student;

