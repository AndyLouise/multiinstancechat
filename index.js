// Includes
"use strict";
require("dotenv").config({ path: require("find-config")(".env") });
const cors = require("cors");
const express = require("express");
const nocache = require("nocache");
const multer = require('multer');
const app = express();
const axios = require('axios');
const volumePath = process.env['RAILWAY_VOLUME_MOUNT_PATH'];

// Config for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, volumePath + "/"); // Specify the destination directory
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Use the original file name
  },
});

// Middleware to check the authentication key
const authenticate = (req, res, next) => {
  const providedKey = req.headers['authorization'];
  const masterKey = process.env['MASTER_KEY'];

  if (providedKey === masterKey) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

const upload = multer({ storage: storage });

let config = {
  dataFormat: process.env.DATA_FORMAT || "json",
  keepArtifacts:
    process.env.KEEP_ARTIFACTS?.toLowerCase().trim() === "true" ? true : false,
  port: process.env.PORT || 8888
};

console.log("--------------------------------");
console.log(`| Multi-Instance Chat!`);
console.log("--------------------------------");
console.log(`| PORT: ${config.port}`);
console.log(`| FORMAT: ${config.dataFormat}`);
console.log(`| KEEP ARTIFACTS: ${config.keepArtifacts}`);
console.log("--------------------------------");

// Init
app.use(cors());
app.use(nocache());
app.use(express.json());
app.engine("html", require("ejs").renderFile);
app.listen(config.port);
app.use(express.static("public"));

// funtions 
function getCurrentTime() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const year = String(now.getFullYear()).slice(-2); // Get last two digits of year
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

function getCurrentDateForFile() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const year = String(now.getFullYear()).slice(-2); // Get last two digits of year
  return `${day}_${month}_${year}`;
}

function removeHtmlTags(htmlString) {
  return htmlString.replace(/<[^>]*>/g, ''); // This regex matches and removes HTML tags
}

function replaceSlursWithAsterisks(inputText, slurs) {
  try{
    slurs.forEach((slur) => {
      const asterisks = '*'.repeat(slur.length);
      // Modify the regular expression to match slurs with any number of spaces between characters
      const slurPattern = slur.split('').map(char => `\\s*${char}`).join('');
      inputText = inputText.replace(new RegExp(slurPattern, 'gi'), asterisks);
    });
  
    return inputText;
  }
  catch (error)
  {
    console.log("Failed to filter slur: "+ inputText + " .");
    return inputText;
  }
  
}

function IsUserBanned(bannedUsers, username) {
  var userIsBanned = false;
  try {
    bannedUsers.forEach((user_banned) => {
      if (user_banned.toLowerCase() == username.toLowerCase())
      {
        userIsBanned = true;
      }
    });
    return userIsBanned;
  } 
  catch (error)
  {
    console.log("Unable to check if user " + username +" is banned");
    return false;
  }
  
}

function getUserPerk(userString) {
  const separator = ':';
  const parts = userString.split(separator);

  if (parts.length === 2) {
    const firstPart = parts[0];
    const secondPart = parts[1];
    return [firstPart, secondPart];
  } else {
    // Handle the case where there are not exactly two parts
    return null;
  }
}

function getTextAfterLastUnderscore(inputString) {
  const parts = inputString.split('_');
  if (parts.length > 1) {
    return parts.pop(); // Returns the last element (text after the last underscore)
  } else {
    return null; // If no underscore is found, return null
  }
}

function ClearLines(messages, linesToRemove)
{
  // Split the content into an array of lines
  const lines = messages.split('\n');
  // Check if there are enough lines to remove
  if (lines.length >= linesToRemove) {
    // Remove the specified number of lines from the end
    lines.splice(-linesToRemove);

    // Join the remaining lines back into a single string
    const updatedContent = lines.join('\n');

    return updatedContent;
  } else {
    console.log('Not enough lines in the file to remove.');
  }
}

async function sendOccupantsCount(numberOfOccupants) {
  var delayedAPIKey = process.env['MASTER_KEY'];
  const url = `https://multiinstancechat-delayedapi-production.up.railway.app/enqueue?auth=${delayedAPIKey}&n=` + numberOfOccupants;
  
  try {
    const response = await axios.get(url);
    if (response.status >= 200 && response.status < 300) {
      console.log('Enqued ' + numberOfOccupants + ' player(s) for deletion');
      return;
    } else {
      throw new Error('the api has failed: ' + response.status);
    }
  } catch (error) {
    console.error('Error fetching data:', error.message);
  }
}

// Routing

//// POST \\\\

// Handle file upload
app.post('/upload', authenticate, upload.single('file'), (req, res) => {  
  res.send('File uploaded successfully!');
});

//// GET \\\\

app.get("/", async (req, res) => {
  res.end("Welcome to Multi-Instance Chat: access https://multiinstancechat-production.up.railway.app/help for more details");
  return;
});

app.get("/help", async (req, res) => {
  res.end(`Multi-Instance Chat was developed by AndyLouise to enable users in VRChat
  to chat between different instances and worlds.\n
  GitHub Project: https://github.com/AndyLouise/multiinstancechat\n
  API Documentation: https://github.com/AndyLouise/multiinstancechat/blob/main/README.md\n
  For any issues please contact me on Twitter: @andyplouise`);
  return;
});

// Serve HTML form for file upload
app.get('/Uploader', (req, res) => {
  const path = require('path');

  const auth = req.query.auth || null;

  const authKey = process.env['MASTER_KEY'];
  // auth
  if (auth !== authKey) {
    res.status(403).send("Access Forbidden: Invalid authentication key");
    return;
  }

  res.sendFile(path.join(__dirname, 'uploader.html'));
});

app.get("/Data", async (req, res) => {
  const fs = require('fs');
  const auth = req.query.auth || null;
  const authKey = process.env['MASTER_KEY'];
  const directoryPath = volumePath + "/";

  if (auth !== authKey) {
    res.status(403).send("Access Forbidden: Invalid authentication key");
    return;
  }

  try{
    // Read the contents of the directory
    const fileNames = fs.readdirSync(directoryPath);

    // Generate an HTML list of files
    const fileList = fileNames.map(fileName => `<li><a href="${volumePath}/${fileName}?auth=${auth}">${fileName}</a></li>`).join('');

    // Send the HTML response
    res.send(`<ul>${fileList}</ul>`);

  } catch (error) {
    console.log("Error: " + error);
    res.status(503).send("Error: " + error);
  }

});

app.get("/Data/:filename", (req, res) => {
  const fs = require('fs');
  const path = require('path');
  const auth = req.query.auth || null;
  const filename = req.params.filename || '';
  const authKey = process.env['MASTER_KEY'];
  const directoryPath = volumePath + "/";

  if (auth !== authKey) {
      res.status(403).send("Access Forbidden: Invalid authentication key");
      return;
  }
  // Construct the full path to the requested file
  const filePath = path.resolve(__dirname, directoryPath, filename);

  // Check if the requested path is a file
  try {
    const stats = fs.statSync(filePath);

    if (stats.isFile()) {
        // If it's a file, send the file as a response
        res.sendFile(filePath);
    } else {
        res.status(404).send("Not Found: File does not exist");
    }
  } catch (error) {
    console.log("Error: " + error);
    res.status(404).send("Error: " + error);
  }
});


app.get("/getChat", async (req, res) => {
  const { ReadFile } = require('./saveLoaderText.js');
  const auth = req.query.auth || null;
  const worldName = req.query.w || "All";
  const fileIDName = process.env['FileID'] + "_" + worldName;
  const fileName = "promptHistory_" + worldName;
  const authKey = process.env['AUTH_KEY'];
  
  if (auth !== authKey) {
    res.status(403).send("Access Forbidden: Invalid authentication key");
    return;
  }
  
  try {
    var fileId = ReadFile("", fileIDName)
    var messages = ReadFile(fileId, fileName);
    res.end(messages);
  }
  catch(error)
  {
    console.log("Failed to get chat: " +  error.message);
    res.end("Failed to get chat: " +  error.message);
  }
});

app.get("/LogChatAndCreateFile", async (req, res) => {
  const { WriteFile, ReadFile, CreateFile, DeleteFile } = require('./saveLoaderText.js');
  const auth = req.query.auth || null;
  const fileNumberName = req.query.file || "FileID_All";
  const authKey = process.env['DEV_API_KEY'];
  const worldName = getTextAfterLastUnderscore(fileNumberName);
  const fileName = "promptHistory_" + worldName;

  // auth (DEV)
  if (auth !== authKey) {
    res.status(403).send("Access Forbidden: Invalid authentication key");
    return;
  }  
  
  try 
  {
    // load file id
    var currentFileId = ReadFile("", fileNumberName);   
    console.log("Logging for " + fileName + currentFileId);
    // get all messages
    var messages = ReadFile(currentFileId, fileName);
    // create new chat log file
    CreateFile(getCurrentDateForFile(), "ChatLog_" + worldName + "_", "Log", messages);
    // delete old file
    DeleteFile(currentFileId, fileName);
    // update file id
    var newFileId = parseInt(currentFileId);
    newFileId = newFileId + 1;
    newFileId = newFileId.toString();
    WriteFile(newFileId, "", false, fileNumberName);
    // success
    res.end(messages);
    //res.end("Created new Chat log");
  } catch (error) {
    console.log("Failed to log chat: " + error);
    res.end("Failed to log chat: " + error);
  }  
});

app.get("/AddBlacklistWord", async (req, res) => {
  const { WriteFile, DeleteLineFromFile } = require('./saveLoaderText.js');
  const auth = req.query.auth || null;
  const authKey = process.env['DEV_API_KEY'];
  const file = "Data/Slurs.txt";
  const fileName = "Slurs";
  const word = req.query.word || null;
  
  // DEV KEY
  if (auth !== authKey) {
    res.status(403).send("Access Forbidden: Invalid authentication key");
    return;
  }

  if(word == null){
    console.log("world not set");
    res.end("Word not set");
    return;
  }

  // set new slur word
  try{
    var fileWord = word + "\n";
    WriteFile(fileWord, "", true, fileName);
    console.log(word + " added to blacklist");
    res.end(word + " added to blacklist");
  } 
  catch (error)
  {
    console.log("Failed to add blacklist word: " + error);
    res.end("failed to add blacklist word: " + error);
  }
});

app.get("/DeleteWordBlacklist", async (req, res) => {
  const { DeleteLineFromFile } = require('./saveLoaderText.js');
  const auth = req.query.auth || null;
  const authKey = process.env['DEV_API_KEY'];
  const word = req.query.word || null;
  const file = "Data/Slurs.txt";

  // DEV KEY
  if (auth !== authKey) {
    res.status(403).send("Access Forbidden: Invalid authentication key");
    return;
  }

  if(word == null){
    console.log("world not set");
    res.end("Word not set");
    return;
  }

  try{
    // delete line
    DeleteLineFromFile(file, word);
    console.log(word + " removed from blacklist");
    res.end(word + " removed from blacklist");
  }
  catch(error)
  {
    console.log("Failed to remove blacklist word: " + error);
    res.end("failed to remove blacklist word: " + error);
  }
});

app.get("/GetBlackList", async (req, res) => {
  const { ReadFile } = require('./saveLoaderText.js');
  const auth = req.query.auth || null;
  const authKey = process.env['DEV_API_KEY'];
  const fileName = "Slurs";

  // DEV KEY
  if (auth !== authKey) {
    res.status(403).send("Access Forbidden: Invalid authentication key");
    return;
  }

  try{
    // get current player count
    var blacklist = ReadFile("", fileName);
    res.end(blacklist);
  }
  catch(error)
  {
    console.log("Failed to get blacklist: " +  error.message);
    res.end("Failed to Get BlackList");
  }
});

app.get("/GetModerators", async (req, res) => {
  const { ReadFile } = require('./saveLoaderText.js');
  const auth = req.query.auth || null;
  const worldName = req.query.w || "All";
  const fileName = "Perks_";
  const authKey = process.env['DEV_API_KEY'];
  
  if (auth !== authKey) {
    res.status(403).send("Access Forbidden: Invalid authentication key");
    return;
  }

  try{
    // get current world perk file
    var perksFile = ReadFile("", fileName + worldName);
    res.end(perksFile);
  }
  catch(error)
  {
    console.log("Failed to get perk file: " +  error.message);
    res.end("Failed to get perk file: " +  error.message);
  }
});

app.get("/AddModerator", async (req, res) => {
  const { WriteFile } = require('./saveLoaderText.js');
  const auth = req.query.auth || null;
  const worldName = req.query.w || "All";
  const username = req.query.username;
  const fileName = "Perks_";
  const perk = req.query.perk;
  const authKey = process.env['DEV_API_KEY'];
  
  if (auth !== authKey) {
    res.status(403).send("Access Forbidden: Invalid authentication key");
    return;
  }

  try{
    // input new user with perk
    WriteFile(username + ":" + perk + "\n", "", true, fileName + worldName);
    // success
    var perkAddSuccess =  "Sucessfully added user " +  username + " with perk " + perk;
    console.log(perkAddSuccess);
    res.end(perkAddSuccess);
  }
  catch(error)
  {
    var perkAddFail =  "Failed to add user " +  username + " with perk " + perk + ": " + error.message;
    console.log(perkAddFail);
    res.end(perkAddFail);
  }
});

app.get("/DeleteModerator", async (req, res) => {
  const { DeleteLineFromFile } = require('./saveLoaderText.js');
  const auth = req.query.auth || null;
  const worldName = req.query.w || "All";
  const username = req.query.username;
  const perk = req.query.perk;
  const authKey = process.env['DEV_API_KEY'];
  const file = "Data/Perks_" + worldName + ".txt";
  
  if (auth !== authKey) {
    res.status(403).send("Access Forbidden: Invalid authentication key");
    return;
  }

  try{
    // input new user with perk
    DeleteLineFromFile(file, username);
    var perkRemoveSuccess =  "Sucessfully removed user " +  username + " with perk " + perk;
    console.log(perkRemoveSuccess);
    res.end(perkRemoveSuccess);
  }
  catch(error)
  {
    var perkRemoveFail =  "Failed to remove user " +  username + " with perk " + perk + ": " + error.message;
    console.log(perkRemoveFail);
    res.end(perkRemoveFail);
  }
});

app.get("/getUsers", async (req, res) => {
  const { ReadFile } = require('./saveLoaderText.js');
  const auth = req.query.auth || null;
  const fileName = "Users";
  const authKey = process.env['AUTH_KEY'];
  
  if (auth !== authKey) {
    res.status(403).send("Access Forbidden: Invalid authentication key");
    return;
  }

  try{
    // get current player count
    var playerNum = ReadFile("", fileName);
    res.end(playerNum);
  }
  catch(error)
  {
    console.log("failed to get player count: " +  error.message);
    res.end("0");
  }
});

app.get("/setUsers", async (req, res) => {
  const { WriteFile, ReadFile, CreateFile, DeleteFile } = require('./saveLoaderText.js');
  const auth = req.query.auth || null;
  const fileId = "Users";
  const authKey = process.env['AUTH_KEY'];
  const action = req.query.action || null;
  var players = req.query.p || "0";
  
  if (auth !== authKey) {
    res.status(403).send("Access Forbidden: Invalid authentication key");
    return;
  }

  if (action == null) {
    res.end("No player count action was defined");
    return;
  }

  // just return 0 if no players
  if (players == "0") {
    res.end(playerNum);
    return;
  }

  try{
    // get current player number
    var playerNumStr = ReadFile("", fileId);
  
    // convert to int
    var playerNum = parseInt(playerNumStr);
    players = parseInt(players);
    
    // update player number
    switch (action) {
      case "add":
        playerNum = playerNum + players;
        // send player for deletion in 5m (they will be re-added in case still in instance)
        sendOccupantsCount(players);
        break;
      
      case "remove":
        playerNum = playerNum - players;
        break;
      
      default:
        break;
    }
    
    // if accidently negative, correct to 0
    if (playerNum < 0) {
      playerNum = 0;
    }
    // convert string
    playerNumStr = playerNum.toString();
    // only save if not NaN
    if (!isNaN(playerNumStr) && playerNumStr != "NaN")
    {
      WriteFile(playerNumStr, "", false, fileId);
    }
    else{
      // if is indeed NaN, not save and only return original player count
      playerNumStr = ReadFile("", fileId);
    }
    res.end(playerNumStr);
  }
  catch(error)
  {
    console.log("Failed to set user count: " + error.message);
    // try to get actual user count from file
    try{
      res.end(ReadFile("", fileId));
    }
    catch(error)
    {
      // if that also fails, return 0
      console.log("failed to return player count: " + error.message);
      res.end("0");
    }
  }
});

app.get("/chat", async (req, res) => {
  const { WriteFile, ReadFile, CreateFile, DeleteLineFromFile } = require('./saveLoaderText.js');
  const auth = req.query.auth || null;
  const pass = process.env['pass'];
  const authKey = process.env['AUTH_KEY'];
  const worldName = req.query.w || "All";
  const fileIDName = process.env['FileID'] + "_" + worldName;
  const fileName = "promptHistory_" + worldName;
  const fileNameBannedUsers = "BannedUsers";
  const slurs = [];
  const maxLengthMessage = 800;
  
  // name options and perks
  var name = req.query.name || "Anonymous";
  var msg = req.query.msg || null;
  var urlPass = req.query.pass || null;
  var messages = "";
  var userCanBan = false;

  // authentication
  if (auth !== authKey) {
    res.status(403).send("Access Forbidden: Invalid authentication key");
    return;
  }

  // message null
  if (msg == null || msg == "") {
    res.end("Your message can't be null, please type something after 'msg=' ");
    return;
  }
  //name null
  if (name == null || name == "") {
    res.end("Your name can't be null, please type something after 'name=' ");
    return;
  }

  // clear html tags
  msg = removeHtmlTags(msg);
  name = removeHtmlTags(name);

  // anti spam
  if (msg.length > maxLengthMessage) {
    console.log("too big message: " + msg.length)
    res.end("Your message is too big, please try something else");
    return;
  }

  
  try {
    // filter
    var slursFile = ReadFile("", 'Slurs');
    var slurLines = slursFile.split('\n').filter(line => line.trim() !== '');
    // populate array
    slurs.push(...slurLines.map(slur => slur.replace(/\s+/g, ''))); // Remove spaces from slurs
    // update message
    msg = replaceSlursWithAsterisks(msg, slurs);
  } 
  catch (error)
  {
    console.log("Unable to replace slur in message: " + error.message)
  }

  // validation of name
  if (urlPass == pass) {
    name =  "<color=yellow>(World Creator)" + name + "</color>";
    // world creators can ban
    userCanBan = true;
  }
  else if (name.toLowerCase().includes("andylouise") && (worldName == "All" || worldName == "SlenderManVR") ) {
    name =  "<color=red>(System) You don't have enough privilege for that</color>";
    msg = "403 Forbidden";
  }

  try
  {
    // bans
    var bannedUsersFile = ReadFile("", fileNameBannedUsers);
    var bannedUsers = bannedUsersFile.split('\n').filter(line => line.trim() !== '');
    if (IsUserBanned(bannedUsers, name)) {
      // <color=red>(System) User is Banned</color>
      name =  "";
      msg = "";
      res.end("<color=red>(System) This User Has Been Banned From Chat</color>");
      return;
    }
  }
  catch (error)
  {
    console.log("Unable to ban selected user: " + error.message)
  }
    
  try{
    // check if perk file exists
    var perksFile = ReadFile("", 'Perks_' + worldName);
    // create perk file with worldName if not exist
    if (perksFile == null) {
      WriteFile("", "", false, 'Perks_' + worldName);
    }
    // only try to get perk if the file is not empty
    else
    {
      // get each line with perk and username
      var perksLines = perksFile.split('\n').filter(line => line.trim() !== '');
      perksLines.forEach((user_perks) => {
        const [UsernamePerk, perk] = getUserPerk(user_perks);
        if (name.toLowerCase() == UsernamePerk.toLowerCase())
        {
          // user has perk
          name =  "<color=green>("+ perk +")" + name + "</color>";
          // if perk is moderator, user can ban
          if(perk == "Moderator"){
            userCanBan = true;
          }
        }
      });
    }

    // commands
    if (userCanBan && msg.charAt(0) == "/") {
      // ban users
      if (msg.includes('/ban')) {
        // Remove "/ban" and any spaces from the message
        const bannedUserName = msg.replace(/\/ban\s+/g, '');
        const userBannedString = bannedUserName.toLowerCase() + "\n";

        try{
          // Add the banned string to the list
          WriteFile(userBannedString, "", true, fileNameBannedUsers);
          console.log("banned user: " + bannedUserName);
          msg = "<color=red>(System) User " + bannedUserName + " Was Banned By "+ name +"</color>";
          name = "";
        } 
        catch (error)
        {
          console.log("failed to ban User: " + bannedUserName + ": " + error.message);
        }
      }
      // unban
      if (msg.includes('/unban')) {
        // Remove "/ban" and any spaces from the message
        const unbannedUserName = msg.replace(/\/unban\s+/g, '');
        const userUnbannedString = unbannedUserName.toLowerCase() + "\n";

        try{
          // remove the user from the list
          DeleteLineFromFile("Data/" + fileNameBannedUsers + ".txt", userUnbannedString);
          console.log("unbanned user: " + unbannedUserName);
          msg = "<color=red>(System) User " + unbannedUserName + " Was Unbanned By "+ name +"</color>";
          name = "";
        } 
        catch (error)
        {
          console.log("failed to unban User: " + unbannedUserName + ": " + error.message);
        }
      }
      
      // clear messages
      /*
      if (msg.includes('/clear')) {
        const numLinesToRemove = msg.replace(/\/clear\s+/g, '');
        var tempFileId = ReadFile("", fileIDName)
        messages = ReadFile(tempFileId, fileName);
        if (messages != null){
          // if messages exist, try to clear lines 
          messages = ClearLines(messages, numLinesToRemove);
          WriteFile(messages, tempFileId, false, fileName);
          console.log("Removed " + numLinesToRemove + " lines");
          msg = "<color=blue>(System) " + numLinesToRemove + " Messages Cleared by "+ name +"</color>";
          name = "";
        }
      }
      */
      
    }
    // revoke ban permission now
    userCanBan = false;
  }
  catch(error)
  {
    console.log("Failed to apply perk or command: " + error.message);
  }
    
    
  try {
    // set up time and formatation
    name = getCurrentTime() + " " + name + ": "; 

    // check if file id exists
    var fileId = ReadFile("", fileIDName)
    // create file with id of one if not exist
    if (fileId == null) {
      WriteFile("1", "", false, fileIDName);
      // update value of fileId cause file did not exist
      fileId = "1";
    }
    
    // check if file exist
    messages = ReadFile(fileId, fileName);
    if (messages == null) {
      // Create file if not exist
      CreateFile(fileId, fileName);
      // file is new so just add user msg
      messages = name + msg + "\n"
    } else {
      // file exists, get existing file content and add msg
      messages = messages + name + msg + "\n";
    }
    // add user question to file
    WriteFile(messages, fileId, false, fileName);
    // return response
    res.end(messages);
  } catch (error) {
    if (error.response) {
      console.log(error.response.status);
      console.log(error.response.data);
    } else {
      console.log(error.message);
    }
    // try again
    res.end("An unknown exception has occured please try again.");
  }
});

app.get("/favicon.ico", (req, res) => res.status(204));
app.get("*", (req, res) => {
  res.status(403).send("Access Forbidden: Invalid authentication key");
});
