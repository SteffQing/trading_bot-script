import fs from 'fs';

function now() {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const days = ['Sun', 'Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat'];

    const time = new Date();

    const year = time.getFullYear();
    const month = months[time.getMonth()];
    const dayOfWeek = days[time.getDay()];
    const day = time.getDate();
    const hours = time.getHours();
    const minutes = time.getMinutes();

    return `${dayOfWeek}, ${day} ${month}. ${year} ${hours}:${minutes.toString().padStart(2, '0')}`;
}

export default function log(
    data: any,
    filePath = './log.txt',
    isError = false
) {
    const contentLine = `${now()} : ${data}\n`;

    fs.appendFile(filePath, contentLine, (err) => {
        if (err) {
            console.error('Error appending to file:', err);
        }
    });

    // Throw error in test mode
}
