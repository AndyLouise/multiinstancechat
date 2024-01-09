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

function DeleteLineFromFile(filePath, searchString) {
  // Read the file
  fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
          console.log('Error reading file:', err);
          return;
      }

      // Split the content into an array of lines
      const lines = data.split('\n');

      // Find the index of the line containing the specified string
      const index = lines.findIndex(line => line.includes(searchString));

      if (index !== -1) {
          // Remove the line from the array
          lines.splice(index, 1);

          // Join the lines back into a string
          const updatedContent = lines.join('\n');

          // Write the updated content back to the file
          fs.writeFile(filePath, updatedContent, 'utf8', (writeErr) => {
              if (writeErr) {
                  console.error('Error writing to file:', writeErr);
                  throw new Error(writeErr);
              }
          });
      } else {
          console.log('String not found in the file.');
          throw new Error('String not found in the file.');
      }
  });
}


function ReadFile(id, fileName='promptHistory', folder='Data')  {
  let data;
  try {
    data = fs.readFileSync(`${folder}/${fileName}${id}.txt`, 'utf-8');
  } catch (error) {
    data = null;
  }
  return data;
}

module.exports = { 
  DeleteFile: (id, fileName='promptHistory', folder='Data') => {
    fs.unlink(`${folder}/${fileName}${id}.txt`, (err) => {
      if (err) {
        return;
      }
    });
    console.log('File deleted successfully or already deleted');
  },
  ReadFile,
  DeleteLineFromFile,
  CreateFile: (id, fileName='promptHistory', folder='Data', initialText='') => {
    console.log('Creating new file: ' + fileName + id);
    WriteFile(initialText, id, false, fileName, folder);
  },
  WriteFile
};