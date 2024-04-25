"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const fs_1 = __importDefault(require("fs"));
(0, dotenv_1.config)();
function now() {
    const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
    ];
    const days = ["Sun", "Mon", "Tues", "Wed", "Thurs", "Fri", "Sat"];
    const time = new Date();
    const year = time.getFullYear();
    const month = months[time.getMonth()];
    const dayOfWeek = days[time.getDay()];
    const day = time.getDate();
    const hours = time.getHours();
    const minutes = time.getMinutes();
    return `${dayOfWeek}, ${day} ${month}. ${year} ${hours}:${minutes.toString().padStart(2, "0")}`;
}
function log(data, filePath = "./log.txt", isError = false) {
    const contentLine = `${now()} : ${data}\n`;
    fs_1.default.appendFile(filePath, contentLine, (err) => {
        if (err) {
            console.error("Error appending to file:", err);
        }
    });
    // Throw error in test mode
    const isTest = process.env.MODE == "dev";
    if (isTest)
        console.log(data);
    if (isError)
        throw new Error(data);
}
exports.default = log;
