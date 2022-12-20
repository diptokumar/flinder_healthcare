const mongoose = require('mongoose');
const dotenv = require('dotenv');
const userModel = require('./models/UserModel/userModel');


process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './.env' });
const app = require('./app');


const DB = process.env.DB_URI;

// console.log(DB);

mongoose
  .connect(DB, {
    // ssl: true,
    // sslValidate: true,
    // sslCA: fs.readFileSync('./staging-ca-certificate.crt'),
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
    autoIndex: true
  })
  .then(() => console.log('DB connection successful!'));

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

const io = require("socket.io")(server, {
  pingTimeout: 60000, //in ms
  cors: {
    origin: "https://gontop.herokuapp.com",
    // credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("Connected to socket.io");

  socket.on("setup",async (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
   await userModel.findOneAndUpdate({ _id: userData._id }, { online: true }, { new: true });

  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });

  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));


  socket.on("new message", (newMessageRecieved, room) =>
    socket.in(room).emit("message recieved", newMessageRecieved)
  );

  // socket.on("new message", (newMessageRecieved) => {
  //   var chat = newMessageRecieved.chat;

  //   if (!chat.users) return console.log("chat.users not defined");
  //   console.log("chat.users", chat.users)
  //   chat.users.forEach((user) => {
  //     if (user._id == newMessageRecieved.sender._id) {
  //       console.log("inside if", newMessageRecieved.sender._id)
  //       socket.in(user._id).emit("message recieved", newMessageRecieved);

  //       // return
  //     };
  //     console.log("outside if", user._id);
  //     socket.in(user._id).emit("message recieved", newMessageRecieved);
  //   });
  // });
  
  socket.on("disconect", async (userData) => {
    await userModel.findByIdAndUpdate(userData._id, { online: false, lastOnline: Date.now() }, { new: true });
  });
  
  socket.off("setup",async () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);
    await userModel.findByIdAndUpdate(userData._id, { online: false,lastOnline: Date.now()}, {new: true});
  });
});




process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
