const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLNonNull,
    GraphQLInt,
    GraphQLFloat
} = require('graphql');
const express=require('express');
const expressGraphQL=require('express-graphql');
const app=express();
const _=require('lodash');

const courses=require('./data/courses.json');
const students=require('./data/students.json');
const grades=require('./data/grades.json');

const courseType = new GraphQLObjectType({
    name:'Course',
    description:'represents courses',
    fields:()=>({
        id:{type:GraphQLNonNull(GraphQLInt)},
        name:{type:GraphQLNonNull(GraphQLString)},
        description:{type:GraphQLNonNull(GraphQLString)}
    })
});

const studentType=new GraphQLObjectType({
    name:'Student',
    description:'Represents students',
    fields:()=>({
        id:{type:GraphQLNonNull(GraphQLInt)},
        name:{type:GraphQLNonNull(GraphQLString)},
        lastname:{type:GraphQLNonNull(GraphQLString)},
        courseId:{type:GraphQLNonNull(GraphQLInt)},
        course:{
            type:courseType,
            resolve:(student)=>{
                return courses.find(course=>course.id==student.courseId);
            }
        }
    })
});

const gradeType=new GraphQLObjectType({
    name: 'Grade',
    description:'Represents grades',
    fields:()=>({
        id:{type:GraphQLNonNull(GraphQLInt)},
        courseId:{type:GraphQLNonNull(GraphQLInt)},
        studentId:{type:GraphQLNonNull(GraphQLInt)},
        grade:{type:GraphQLNonNull(GraphQLFloat)},
        course:{
            type:courseType,
            resolve:(grade)=>{
                return courses.find(course=>course.id==grade.courseId);
            }
        },
        student:{
            type:studentType,
            resolve:(grade)=>{
                return students.find(student=>student.id==grade.studentId);
            }
        }
    })
});

const querys=new GraphQLObjectType({
    name:'Query',
    description:'Root Query',
    fields:()=>({
        courses:{
            type:new GraphQLList(courseType),
            description:'List of all Courses',
            resolve:()=> courses
        },
        students:{
            type:new GraphQLList(studentType),
            description:'List of all Students',
            resolve:()=> students
        },
        grades:{
            type:new GraphQLList(gradeType),
            description:'List of all Grades',
            resolve:()=> grades
        },
        course:{
            type:courseType,
            description:'Specific Course by Id',
            args:{
                id:{type:GraphQLInt}
            },
            resolve:(parent,args)=>courses.find(course=>course.id==args.id)
        },
        student:{
            type:studentType,
            description:'Specific Student by Id',
            args:{
                id:{type:GraphQLInt}
            },
            resolve:(parent,args)=>students.find(student=>student.id==args.id)
        },
        grade:{
            type:gradeType,
            description:'Particular grade by Id',
            args:{
                id:{type:GraphQLInt}
            },
            resolve:(parent,args)=> grades.find(grade=>grade.id==args.id)
        }
    })
});

const mutations=new GraphQLObjectType({
    name:'Mutation',
    description:'Root Mutation',
    fields:()=>({
        createCourse:{
            type:courseType,
            description:'Create a Course',
            args:{
                name:{type:GraphQLString},
                description:{type:GraphQLString}
            },
            resolve:(parent,args) =>{
               const course={
                   id:courses.length+1,
                   name:args.name,
                   description:args.description
               };
               courses.push(course);
               return course;
            }
        },
        createStudent:{
            type:studentType,
            description:'Create a Student',
            args:{
                name:{type:GraphQLString},
                lastname:{type:GraphQLString},
                courseId:{type:GraphQLInt}
            },
            resolve:(parent,args)=>{
                const student={
                    id:students.length+1,
                    name:args.name,
                    lastname:args.lastname,
                    courseId:args.courseId
                };
                students.push(student);
                return student;
            }
        },
        createGrade:{
            type:gradeType,
            description:'Post a Grade',
            args:{
                courseId:{type:GraphQLInt},
                studentId:{type:GraphQLInt},
                grade:{type:GraphQLFloat}
            },
            resolve:(parent,args)=>{
                const grade={
                    id:grades.length+1,
                    courseId:args.courseId,
                    studentId:args.studentId,
                    grade:args.grade
                };
                grades.push(grade);
                return grade;
            }
        },
        deleteCourse:{
            type:new GraphQLList(courseType),
            description:'Delete a Course',
            args:{
                id:{type:GraphQLInt}
            },
            resolve:(parent,args)=>{
                _.remove(courses,(course)=>{return course.id==args.id})
                return courses;
                }
        },
        deleteStudent:{
            type:new GraphQLList(studentType),
            description:'Delete a Student with assigned grades',
            args:{
                id:{type:GraphQLInt}
            },
            resolve:(parent,args)=>{
                _.remove(students,(student)=>{return student.id==args.id});
                _.remove(grades,(grade)=>{return grade.studentId==args.id});
                return students;
            }
        },
        deleteGrade:{
            type:new GraphQLList(gradeType),
            description:'Delete a Grade',
            args:{
                id:{type:GraphQLInt}
            },
            resolve:(parent,args)=>{
                _.remove(grades,(grade)=>{return grade.id==args.id})
                return grades;
            }
        }
    })
});

const schema=new GraphQLSchema({
    query:querys,
    mutation:mutations
});

app.use('/graphql',expressGraphQL({
    schema:schema,
    graphiql: true
}));

app.listen(3000,()=>{
    console.log("Server's up!");
});

