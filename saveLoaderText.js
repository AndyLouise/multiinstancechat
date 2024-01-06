const fs = require('fs');

function WriteFile(prompt, id, append=false, fileName="promptHistory", folder="Data"){

  if(append) {
    // Write the string to a file
    fs.appendFile(`${folder}/${fileName}${id}.txt`, prompt, function(err) {
      if (err) {
        console.log(err);
      } else {
        console.log('Object saved to file');
      }
    });
  } else {
    // Write the string to a file
    fs.writeFile(`${folder}/${fileName}${id}.txt`, prompt, function(err) {
      if (err) {
        console.log(err);
      } else {
        console.log('Object saved to file');
      }
    });
  }
}

function ReadFile(id, fileName="promptHistory", folder="Data")  {
  let data;
  try {
    data = fs.readFileSync(`${folder}/${fileName}${id}.txt`, 'utf-8');
  } catch (error) {
    data = null;
  }
  return data;
}

module.exports = { 
  DeleteFile: (id, fileName="promptHistory", folder="Data") => {
    fs.unlink(`${folder}/${fileName}${id}.txt`, (err) => {
      if (err) {
        return;
      }
    });
    console.log('File deleted successfully or already deleted');
  },
  ReadFile,
  CreateFile: (id, fileName="promptHistory", folder="Data", initialText="") => {
    console.log("Creating new file: " + fileName + id);
    //let mainPrompt = ReadFile("-1") + "\n";
    WriteFile(initialText, id, false, fileName, folder);
  },
  WriteFile
};