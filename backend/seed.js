require("dotenv").config(); // 1. Load environment variables
const mongoose = require("mongoose");

// 2. Use the URI from your .env file
const MONGO_URI = process.env.MONGO_URI; 

if (!MONGO_URI) {
  console.error("❌ Error: MONGO_URI is not defined in the .env file.");
  process.exit(1);
}

async function connectDB() {
  try {
    // 3. Connect using the env variable
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to the database specified in .env");
    await seedData();
  } catch (err) {
    console.error("❌ Connection Error:", err.message);
    process.exit(1);
  }
}

// ================= MODELS =================
// (I've kept these exactly as you provided)

const Manager = mongoose.model("Manager", new mongoose.Schema({
  name: String, email: String, password: String
}, { timestamps: true }));

const Employee = mongoose.model("Employee", new mongoose.Schema({
  name: String, email: String, password: String, role: String
}, { timestamps: true }));

const Client = mongoose.model("Client", new mongoose.Schema({
  name: String, email: String, password: String, contact: String
}, { timestamps: true }));

const Project = mongoose.model("Project", new mongoose.Schema({
  title: String, description: String,
  manager: { type: mongoose.Schema.Types.ObjectId, ref: "Manager" },
  client: { type: mongoose.Schema.Types.ObjectId, ref: "Client" },
  status: String
}, { timestamps: true }));

const Task = mongoose.model("Task", new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
  title: String, description: String, status: String,
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Manager" },
  deadline: Date
}, { timestamps: true }));

const Comment = mongoose.model("Comment", new mongoose.Schema({
  task: { type: mongoose.Schema.Types.ObjectId, ref: "Task" },
  userType: String, userId: mongoose.Schema.Types.ObjectId, text: String
}, { timestamps: true }));

const File = mongoose.model("File", new mongoose.Schema({
  task: { type: mongoose.Schema.Types.ObjectId, ref: "Task" },
  fileName: String, filePath: String, uploadedBy: mongoose.Schema.Types.ObjectId, uploadedByType: String
}, { timestamps: true }));

const Message = mongoose.model("Message", new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
  senderId: mongoose.Schema.Types.ObjectId, senderType: String, message: String
}, { timestamps: true }));

const Notification = mongoose.model("Notification", new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId, userType: String, message: String, isRead: Boolean
}, { timestamps: true }));

const TaskActivity = mongoose.model("TaskActivity", new mongoose.Schema({
  task: { type: mongoose.Schema.Types.ObjectId, ref: "Task" },
  updatedBy: mongoose.Schema.Types.ObjectId, oldStatus: String, newStatus: String
}, { timestamps: true }));

// ================= SEED DATA =================

async function seedData() {
  try {
    // Clear existing data
    await Promise.all([
      Manager.deleteMany(), Employee.deleteMany(), Client.deleteMany(),
      Project.deleteMany(), Task.deleteMany(), Comment.deleteMany(),
      File.deleteMany(), Message.deleteMany(), Notification.deleteMany(),
      TaskActivity.deleteMany()
    ]);

    // Create Sample Data
    const manager = await Manager.create({ name: "Ali Manager", email: "manager@gmail.com", password: "1234" });
    const emp1 = await Employee.create({ name: "Ahmed", email: "ahmed@gmail.com", password: "1234", role: "Developer" });
    const emp2 = await Employee.create({ name: "Sara", email: "sara@gmail.com", password: "1234", role: "Tester" });
    const client = await Client.create({ name: "John", email: "client@gmail.com", password: "1234", contact: "03001234567" });

    const project = await Project.create({
      title: "SmartCollab", description: "Collaboration Platform",
      manager: manager._id, client: client._id, status: "Active"
    });

    const task = await Task.create({
      project: project._id, title: "Login System", description: "Build auth module",
      status: "InProgress", assignedTo: emp1._id, assignedBy: manager._id, deadline: new Date()
    });

    await Comment.create({ task: task._id, userType: "Employee", userId: emp1._id, text: "Working on login" });
    await File.create({ task: task._id, fileName: "design.pdf", filePath: "/uploads/design.pdf", uploadedBy: emp1._id, uploadedByType: "Employee" });
    await Message.create({ project: project._id, senderId: manager._id, senderType: "Manager", message: "Start working on project" });
    await Notification.create({ userId: emp1._id, userType: "Employee", message: "New task assigned", isRead: false });
    await TaskActivity.create({ task: task._id, updatedBy: emp1._id, oldStatus: "Backlog", newStatus: "InProgress" });

    console.log("🎉 SEEDING COMPLETE: Fake database is ready!");
    process.exit(0); // Exit process once done
  } catch (err) {
    console.error("❌ Seeding Error:", err);
    process.exit(1);
  }
}

connectDB();