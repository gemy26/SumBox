const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '../files/data.txt');


const getFileData = () =>{
    let fileData = parseInt(fs.readFileSync(filePath, 'utf-8')) || 0;
    return fileData;
}

const saveFileData = (data) =>{
    fs.writeFileSync(filePath, data.toString(), 'utf-8');
}

module.exports = {
    getFileData,
    saveFileData
}