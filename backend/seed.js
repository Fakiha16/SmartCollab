const mongoose = require("mongoose");

const MONGO_URI = "mongodb://fakihasarfraz:qwerty54321@ac-jgny412-shard-00-00.ur3pwt4.mongodb.net:27017,ac-jgny412-shard-00-01.ur3pwt4.mongodb.net:27017,ac-jgny412-shard-00-02.ur3pwt4.mongodb.net:27017/smartcollab?ssl=true&replicaSet=atlas-lk50kw-shard-0&authSource=admin&appName=smartcollab";

async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB Connected");
    await seedData();
  } catch (err) {
    console.log(err);
  }
}

// ================= MODELS =================

const Manager = mongoose.model("Manager", new mongoose.Schema({
  name: String,
  email: String,
  password: String
}, { timestamps: true }));

const Employee = mongoose.model("Employee", new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String
}, { timestamps: true }));

const Client = mongoose.model("Client", new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  contact: String
}, { timestamps: true }));

const Project = mongoose.model("Project", new mongoose.Schema({
  title: String,
  description: String,
  manager: { type: mongoose.Schema.Types.ObjectId, ref: "Manager" },
  client: { type: mongoose.Schema.Types.ObjectId, ref: "Client" },
  status: String
}, { timestamps: true }));

const Task = mongoose.model("Task", new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
  title: String,
  description: String,
  status: String,
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Manager" },
  deadline: Date
}, { timestamps: true }));

const Comment = mongoose.model("Comment", new mongoose.Schema({
  task: { type: mongoose.Schema.Types.ObjectId, ref: "Task" },
  userType: String,
  userId: mongoose.Schema.Types.ObjectId,
  text: String
}, { timestamps: true }));

const File = mongoose.model("File", new mongoose.Schema({
  task: { type: mongoose.Schema.Types.ObjectId, ref: "Task" },
  fileName: String,
  filePath: String,
  uploadedBy: mongoose.Schema.Types.ObjectId,
  uploadedByType: String
}, { timestamps: true }));

const Message = mongoose.model("Message", new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
  senderId: mongoose.Schema.Types.ObjectId,
  senderType: String,
  message: String
}, { timestamps: true }));

const Notification = mongoose.model("Notification", new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  userType: String,
  message: String,
  isRead: Boolean
}, { timestamps: true }));

const TaskActivity = mongoose.model("TaskActivity", new mongoose.Schema({
  task: { type: mongoose.Schema.Types.ObjectId, ref: "Task" },
  updatedBy: mongoose.Schema.Types.ObjectId,
  oldStatus: String,
  newStatus: String
}, { timestamps: true }));

// ================= SEED DATA =================

async function seedData() {
  try {
    await Manager.deleteMany();
    await Employee.deleteMany();
    await Client.deleteMany();
    await Project.deleteMany();
    await Task.deleteMany();
    await Comment.deleteMany();
    await File.deleteMany();
    await Message.deleteMany();
    await Notification.deleteMany();
    await TaskActivity.deleteMany();

    // Manager
    const manager = await Manager.create({
      name: "Ali Manager",
      email: "manager@gmail.com",
      password: "1234"
    });

    // Employees
    const emp1 = await Employee.create({
      name: "Ahmed",
      email: "ahmed@gmail.com",
      password: "1234",
      role: "Developer"
    });

    const emp2 = await Employee.create({
      name: "Sara",
      email: "sara@gmail.com",
      password: "1234",
      role: "Tester"
    });

    // Client
    const client = await Client.create({
      name: "John",
      email: "client@gmail.com",
      password: "1234",
      contact: "03001234567"
    });

    // Project
    const project = await Project.create({
      title: "SmartCollab",
      description: "Collaboration Platform",
      manager: manager._id,
      client: client._id,
      status: "Active"
    });

    // Task
    const task = await Task.create({
      project: project._id,
      title: "Login System",
      description: "Build authentication module",
      status: "InProgress",
      assignedTo: emp1._id,
      assignedBy: manager._id,
      deadline: new Date()
    });

    // Comment
    await Comment.create({
      task: task._id,
      userType: "Employee",
      userId: emp1._id,
      text: "Working on login"
    });

    // File
    await File.create({
      task: task._id,
      fileName: "design.pdf",
      filePath: "/uploads/design.pdf",
      uploadedBy: emp1._id,
      uploadedByType: "Employee"
    });

    // Message
    await Message.create({
      project: project._id,
      senderId: manager._id,
      senderType: "Manager",
      message: "Start working on project"
    });

    // Notification
    await Notification.create({
      userId: emp1._id,
      userType: "Employee",
      message: "New task assigned",
      isRead: false
    });

    // Task Activity
    await TaskActivity.create({
      task: task._id,
      updatedBy: emp1._id,
      oldStatus: "Backlog",
      newStatus: "InProgress"
    });

    console.log("🎉 FULL DATABASE READY (100% ERD MATCH)");
    mongoose.connection.close();

  } catch (err) {
    console.log(err);
  }
}

connectDB();