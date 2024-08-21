const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");


const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// mongoose.connect("mongodb://localhost:27017/Chesshub",{
// }).then(res =>{
//         console.log("Mongodb connected")
//     })

// const sch =({
//     name: String,
//     age: Number,
//     email: String,
//     id: Number,
//     date: Date
// })
// const monmodel = mongoose.model("clients", sch)

// //  POSTING THE DATA

// app.post("/post", async(req, res)=>{
//     console.log("inside post function")

//     const data = new monmodel({
//         name: req.body.name,
//         age: req.body.age,
//         email: req.body.email,
//         id: req.body.id,
//         date: req.body.date

//     })
//     const val=await data.save();
//     res.json(val);
// })




app.use(session({
    secret: process.env.SESSION_SECRET || "01m01e01k01e",
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 300000 // 3 min
    }
}))


const activeRooms = [];
let pendingRooms = [];


let turns = {};

io.on("connection", (socket) => {

    console.log("a user connected");


    socket.on("joinRoom", (roomName) => {
        console.log(roomName)
        if (pendingRooms.length <= 0) {
            socket.join(roomName)
            pendingRooms.push({ [roomName]: { client1: socket.id, client2: null } })
            console.log("first hwsdfgjuakG", pendingRooms)
        }

        else {
            
            console.log(roomName)
            roomName = Object.keys(pendingRooms[0])
            console.log(roomName)
            socket.join(roomName[0])

            // Update client2 if the room is found
            
            pendingRooms[0][roomName].client2 = socket.id;
            

            io.to(roomName).emit("StartGame", roomName);

            
            
            function chooseASide() {
                let list = [pendingRooms[0][roomName].client1, pendingRooms[0][roomName].client2];
                let index = Math.floor(Math.random() * list.length);
            
                // Assign "black" side to the randomly chosen client
                socket.to(list[index]).emit("side", "black");
            
                // Assign "white" side to the other client
                socket.to(list[1 - index]).emit("side", "white");
            }
            
            chooseASide();
            
            
            activeRooms.push(pendingRooms[0])
            console.log(activeRooms)
            pendingRooms.pop(pendingRooms[0])
            console.log(pendingRooms)






        }
    })
    socket.on("movedPiece", (data) => {
        if (activeRooms.length > 0){
            if (data[2] in activeRooms[0]) {
                
                //selecting the socket id's

                client1SocketId = activeRooms[0][data[2]].client1
                client2SocketId = activeRooms[0][data[2]].client2
                
                

                const otherClient = (client1SocketId === socket.id) ? client2SocketId : client1SocketId;

                if (otherClient) {
                    console.log(client1SocketId)
                    console.log(socket.id)
                    io.to(otherClient).emit('updateBoard', data);
                }
    
    
            }
        }
    })

    socket.on("disconnect", () => {
        console.log("disconnected");
    });
});


// database (DBMs)
const users = {
    "Meke": {
        age: 20,
        gender: "male",
        passcode: "myname2004"
    },
    "John": {
        age: 20,
        gender: "male",
        passcode: "01010155"
    },
    "Jose": {
        age: 20,
        gender: "male",
        passcode: "01010155"
    },
    "David": {
        age: 20,
        gender: "male",
        passcode: "01010155"
    }
}


// serving files using routes

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.get('/test', (req, res) => {
    res.send('Server is working');
});
// login submittion
app.use(express.urlencoded({ extended: true }));
app.post("/", (req, res) => {
    let username = req.body.username
    let password = req.body.password

    if (username in users && password === users[username].passcode) {
        req.session.user = { "username": username, "password": password }
        res.redirect("/home")
    }
    else {
        res.redirect("/login?error=invalid username or password")
    }

    console.log(req.session)
})
// signup submittion
app.post("/chesshub/signup-Auth-token", (req, res) => {
    
    let fullname = req.body.fullname
    let email = req.body.email
    let username = req.body.username
    let country = req.body.country
    let phoneNumber = req.body.phoneNumber
    let password = req.body.password

    if (username in users) {
        
        res.redirect("/chesshub/signup-Auth-token?error=username already taken")
    }
    else {
        req.session.user = { "fullname": fullname, "email": email, "username":username, "country":country, "phoneNumber":phoneNumber, "password": password }
        res.redirect("/home")
    }

    console.log(req.session)
})

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/chesshub/signup-Auth-token', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

app.get('/home', (req, res) => {
    if (req.session.user){
        res.sendFile(path.join(__dirname, 'public', 'home.html'));
    }
    else{
        res.redirect("/login?error=You need to be logged in to do that")
        
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.redirect('/home'); // Redirect to dashboard if error occurs
        }

        // Clear the session cookie
        res.clearCookie('connect.sid');
        res.redirect("/")

    })
});

// ajax api route
app.get('/api/user-info', (req, res) => {
    console.log("ajax api request")
    if (req.session && req.session.user) {
        res.json({ username: req.session.user.username });
    } else {
        res.status(401).json({ error: 'User not authenticated' });
    }
});


app.use(express.static(path.join(__dirname, "public")));

const port = 9922;
server.listen(port, () => {
    console.log("server running....");
});