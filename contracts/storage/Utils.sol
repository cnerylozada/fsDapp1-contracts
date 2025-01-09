// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

library Utils {
    enum StudentLevel {
        BEGINNER,
        MEDIUM,
        ADVANCED
    }
    struct Student {
        string name;
        StudentLevel level;
    }
}
