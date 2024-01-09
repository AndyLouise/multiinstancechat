# Multi Instance Chat
## An multi-instance chat made to enable a chatbox between worlds on vrchat

## API Endpoint
- https://multiinstancechat-production.up.railway.app

## Public API KEY
- TDE4RkVN

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
        - `auth`: Authentication key (Global)
        - `w`: World name (default: "All")
    - Response: Returns the chat log for the specified parameters.
    - Example:
    ```
        https://multiinstancechat-production.up.railway.app/getChat?auth=TDE4RkVN&w=All
    ```

## Log Chat and Create File
- Endpoint: `/LogChatAndCreateFile`
    - Description: Logs the chat messages, creates a new chat log file, and deletes the old file.
    - Method: `GET`
    - Query Parameters:
        - `auth`: Authentication key (Private)
        - `file`: File number name (default: "FileID_All")
    - Response: Returns the messages after performing the log and file operations.
    - Example:
    ```
        https://multiinstancechat-production.up.railway.app/LogChatAndCreateFile?auth=<YOUR_API_KEY>&file=FileID_All
    ```

## Add Blacklist Word
- Endpoint: `/AddBlacklistWord`
    - Description: Adds a new word to the blacklist for filtering.
    - Method: `GET`
    - Query Parameters:
        - `auth`: Authentication key (Private)
        - `word`: Word to be added to the blacklist
    - Response: Indicates success or failure in adding the word to the blacklist.
    - Example:
    ```
        https://multiinstancechat-production.up.railway.app/AddBlacklistWord?auth=<YOUR_API_KEY>&word=<BAD_WORD>
    ```
    
## Get Blacklist
- Endpoint: `/GetBlackList`
    - Description: Gets the Blacklist
    - Method: `GET`
    - Query Parameters:
        - `auth`: Authentication key (Private)
    - Response: List with all the blacklisted words
    - Example:
    ```
        https://multiinstancechat-production.up.railway.app/getBlackList?auth=<YOUR_API_KEY>
    ```

## Get Users
- Endpoint: `/getUsers`
    - Description: Retrieves the current number of online users.
    - Method: `GET`
    - Query Parameters:
        - `auth`: Authentication key (Public)
    - Response: Returns user information from the "Users" file.
    - Example:
    ```
        https://multiinstancechat-production.up.railway.app/getUsers?auth=TDE4RkVN
    ```

## Chat
- Endpoint: `/chat`
    - Description: Allows you to send a message on the specified server.
    - Method: `GET`
    - Query Parameters:
        - `auth`: Authentication key (Public)
    - Response: Returns user information from the "Users" file.
    - Example:
    ```
        https://multiinstancechat-production.up.railway.app/chat?auth=TDE4RkVN
        &name=<your_username>&w=<world_name>&msg=
    ```

## Chat Commands
### To use chat commands you must be an Moderator or have some perk

### Ban Command
 - Just type '/ban <user_name>' on the chat and the specified user will not be able to send messages on the chat

### Unban Command
- Just type '/unban <user_name>' on the chat and the specified user will be able to send messages on the chat again

