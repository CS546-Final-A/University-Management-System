import _ from 'lodash';
import { ObjectId } from "mongodb";
const data =[{
    "_id": {
      "$oid": "657fa9dc5ca7fcd983909061"
    },
    "courseNumber": 546,
    "courseName": "Web Development I",
    "courseDepartmentId": {
      "$oid": "657f93aa8516a518ea54e32a"
    },
    "courseCredits": 3,
    "courseDescription": "Take me",
    "courseSemester": "Fall",
    "courseYear": "2023",
    "sections": [
      {
        "sectionName": "A",
        "sectionInstructor": {
          "$oid": "657f86ee49985ad997d14d0a"
        },
        "sectionType": "In Person",
        "sectionStartTime": "18:30",
        "sectionEndTime": "21:00",
        "sectionDay": "Thursday",
        "sectionCapacity": 40,
        "sectionLocation": "Kiddie 315",
        "sectionDescription": "A cool section",
        "sectionId": {
          "$oid": "657faa045ca7fcd983909062"
        },
        "students": [
          {
            "$oid": "657f90c649985ad997d14d0e"
          },
          {
            "$oid": "657f90d349985ad997d14d0f"
          },
          {
            "$oid": "657f90f249985ad997d14d10"
          }
        ],
        "assignments": [
          {
            "$oid": "657fab0c5ca7fcd983909068"
          },
          {
            "$oid": "657fab295ca7fcd983909069"
          }
        ],
        "sectionModules": [
          {
            "moduleId": {
              "$oid": "657face35ca7fcd98390906f"
            },
            "moduleName": "Week 1",
            "moduleDescription": "Welcomw",
            "moduleDate": "2023-12-12",
            "attendance": [
              {
                "name": "Prof One",
                "userId": "657f86ee49985ad997d14d0a",
                "latitude": 40.7415,
                "longitude": -74.0487,
                "type": "Professor",
                "timeStamp": {
                  "$numberLong": "1702867665905"
                }
              },
              {
                "name": "Stud One",
                "userId": "657f90c649985ad997d14d0e",
                "latitude": 40.7415,
                "longitude": -74.0487,
                "type": "Student",
                "timeStamp": {
                  "$numberLong": "1702867687708"
                }
              }
            ]
          },
          {
            "moduleId": {
              "$oid": "657fadef5ca7fcd983909070"
            },
            "moduleName": "Week 2",
            "moduleDescription": "Take attendance here",
            "moduleDate": "2023-12-12",
            "attendance": [
              {
                "name": "Prof One",
                "userId": "657f86ee49985ad997d14d0a",
                "latitude": 40.7415,
                "longitude": -74.0487,
                "type": "Professor",
                "timeStamp": {
                  "$numberLong": "1702867665905"
                }
              },
              {
                "name": "Stud One",
                "userId": "657f90c649985ad997d14d0e",
                "latitude": 40.7415,
                "longitude": -74.0487,
                "type": "Student",
                "timeStamp": {
                  "$numberLong": "1702867687708"
                }
              }
            ]
          }
        ]
      },
      {
        "sectionName": "B",
        "sectionInstructor": {
          "$oid": "657f86ee49985ad997d14d0a"
        },
        "sectionType": "Online",
        "sectionStartTime": "04:00",
        "sectionEndTime": "07:00",
        "sectionDay": "Friday",
        "sectionCapacity": 30,
        "sectionLocation": "Online",
        "sectionDescription": "A less cool section",
        "sectionId": {
          "$oid": "657faa245ca7fcd983909063"
        },
        "students": [],
        "assignments": [
          {
            "$oid": "657fac9d5ca7fcd98390906d"
          }
        ]
      }
    ],
    "courseLearning": {
      "headings": [
        "Homework"
      ],
      "files": [
        {
          "_id": {
            "$oid": "657fabd55ca7fcd98390906a"
          },
          "heading": "Homework",
          "fileName": "textfile.pdf",
          "filePath": "files/materials/657fa9dc5ca7fcd983909061/Homework/textfile.pdf"
        }
      ]
    }
  },
  {
    "_id": {
      "$oid": "657faa5a5ca7fcd983909064"
    },
    "courseNumber": 556,
    "courseName": "Web Development II",
    "courseDepartmentId": {
      "$oid": "657f93aa8516a518ea54e32a"
    },
    "courseCredits": 3,
    "courseDescription": "A cooler web dev",
    "courseSemester": "Spring",
    "courseYear": "2024",
    "sections": [
      {
        "sectionName": "A",
        "sectionInstructor": {
          "$oid": "657f86ee49985ad997d14d0a"
        },
        "sectionType": "In Person",
        "sectionStartTime": "10:00",
        "sectionEndTime": "12:00",
        "sectionDay": "Monday",
        "sectionCapacity": 50,
        "sectionLocation": "Kiddie 215",
        "sectionDescription": "The only section for 556",
        "sectionId": {
          "$oid": "657faa815ca7fcd983909065"
        },
        "students": [
          {
            "$oid": "657f90c649985ad997d14d0e"
          }
        ],
        "assignments": [
          {
            "$oid": "657facc15ca7fcd98390906e"
          }
        ]
      }
    ],
    "courseLearning": {
      "headings": [],
      "files": []
    }
  },
  {
    "_id": {
      "$oid": "657faaa25ca7fcd983909066"
    },
    "courseNumber": 901,
    "courseName": "Thesis Writing",
    "courseDepartmentId": {
      "$oid": "657f93aa8516a518ea54e32a"
    },
    "courseCredits": 9,
    "courseDescription": "Write a thesis",
    "courseSemester": "Fall",
    "courseYear": "2023",
    "sections": [
      {
        "sectionName": "A",
        "sectionInstructor": {
          "$oid": "657f909849985ad997d14d0b"
        },
        "sectionType": "Online",
        "sectionStartTime": "00:00",
        "sectionEndTime": "23:59",
        "sectionDay": "Wednesday",
        "sectionCapacity": 3,
        "sectionLocation": "Online",
        "sectionDescription": "Office Hours with the thesis advisor",
        "sectionId": {
          "$oid": "657faaca5ca7fcd983909067"
        },
        "students": [
          {
            "$oid": "657f90c649985ad997d14d0e"
          }
        ],
        "assignments": [
          {
            "$oid": "657fae615ca7fcd983909071"
          }
        ]
      }
    ],
    "courseLearning": {
      "headings": [],
      "files": []
    }
  }]
function replaceObjectId(obj) {
    // Base case: if the object is not an object or is null, return it as is
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }
  
    // Check if the current object has "$oid" property
    if (_.isObject(obj) && _.has(obj, '$oid')) {
      // Replace the "$oid" property with new ObjectId
      return new ObjectId(obj['$oid']);
    }
  
    // Recursively process each property of the object
    return _.mapValues(obj, value => replaceObjectId(value));
  }

  
  // Replace "$oid" with new ObjectId
  const updatedData = _.map(data, item => replaceObjectId(item));
  
  console.log(updatedData);