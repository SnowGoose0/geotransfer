# GeoTransfer
[GeoTransfer](https://dsend-web.web.app/) is a location-based file sharing application that enables users to discover and connect with each other on a map. A user can discover nearby users and send/receive files and messages from anonymous users who are discoverable via an alias.

Connect onto GeoTransfer here: https://dsend-web.web.app/

Note: the server will take a couple seconds to start up if inactive.

# GeoTransfer Tech-Stack
- `front-end`: vite + vue.js, google-maps api, socket.io-client
- `back-end`: node.js, express.js, socket.io
- `deployment/host`: firebase hosting (front-end), render web-services (back-end)
- `language/tools`: javascript, html, scss, git

# How to use GeoTransfer?
## Map navigation
- pan: `left/right/mw click + drag`
- zoom: `mw scroll`

## Discover connected users
- your alias is displayed on the top right
- users can be discovered by clicking on the `pins` on the map
- a `pin` may consist of `multiple users` (that are close together)
- the list of users of an associated pin are displayed on the right column

## Sending a file/message
1. click on a `pin` on the map
2. select the a connected user by clicking their name on the right column
3. choose a file or type a message in the `form box`
4. click `send` 

## Receiving a file
1. a pop-up will be displayed showing the name of the `sender` and `file`
2. click `accept` to begin downloading the file
3. click 'reject' to ignore the request

## Receiving a message
1. a pop-up will be displayed showing the name of the `sender` and the `message`
2. click 'close' to close the message pop-up

# Local installation
Note: You will have to configure a few environment variables on your own.

1. clone the repository from GitHub
    ```sh
    $ git clone link[https/ssh]
    ```

2. configure and run front-end
    ```sh
    $ cd geo-client
    $ npm install
    $ npm run dev
    ```

3. configure and run back-end
    ```sh
    # default port: 8080
    $ cd geo-socket
    $ npm install
    $ node index.js
    ```
