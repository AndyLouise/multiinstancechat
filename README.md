# Multi Instance Chat
## An multi-instance chat made to enable a chatbox between worlds on vrchat

## API Url
- https://multiinstancechat-production.up.railway.app

## Welcome Message
- Endpoint: `/`
    - Description: Returns a welcome message for the Multi-Instance Chat.
    - Method: `GET`
    - Response: "Welcome to Multi-Instance Chat: use /help for more details"

## Help Information
- Endpoint: `/help`
    - Description: Provides information about how to use the chat.
    - Method: `GET`
    - Return help information to use the API

## Get Chat Log
- Endpoint: `/getChat`
    - Description: Retrieves the chat log based on the provided parameters.
    - Method: `GET`
    - Query Parameters:
        - `auth`: Authentication key
        - `w`: World name (default: "All")
    - Response: Returns the chat log for the specified parameters.

## Log Chat and Create File
- Endpoint: `/LogChatAndCreateFile`
    - Description: Logs the chat messages, creates a new chat log file, and deletes the old file.
    - Method: `GET`
    - Query Parameters:
        - `auth`: Authentication key
        - `file`: File number name (default: "FileID_All")
    - Response: Returns the messages after performing the log and file operations.

## Add Blacklist Word
- Endpoint: `/AddBlacklistWord`
    - Description: Adds a new word to the blacklist for filtering.
    - Method: `GET`
    - Query Parameters:
        - `auth`: Authentication key
        - `word`: Word to be added to the blacklist
    - Response: Indicates success or failure in adding the word to the blacklist.

## Get Users
- Endpoint: `/getUsers`
    - Description: Retrieves user information.
    - Method: `GET`
    - Query Parameters:
        - `auth`: Authentication key
    - Response: Returns user information from the "Users" file.
