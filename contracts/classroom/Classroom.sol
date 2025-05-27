// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;
import {Utils} from "./Utils.sol";

contract Classroom {
    string private s_course;
    Utils.Student[] private s_students;
    uint s_creationDate;

    constructor(string memory _course) {
        s_course = _course;
        s_creationDate = block.timestamp;
    }

    event NewStudentAdded(string _name, Utils.StudentLevel _level);

    function addNewStudent(
        string calldata _name,
        Utils.StudentLevel _level
    ) external {
        Utils.Student memory student = Utils.Student({
            name: _name,
            level: _level
        });
        s_students.push(student);
        emit NewStudentAdded(_name, _level);
    }

    function getMetadata() external view returns (string memory, uint) {
        return (s_course, s_creationDate);
    }

    function getStudentByIndex(
        uint _index
    ) external view returns (string memory, Utils.StudentLevel) {
        Utils.Student memory student = s_students[_index];
        return (student.name, student.level);
    }
}
