const {mongoose, Schema, ObjectId} = require("mongoose");

const User = new Schema({
  username: String,
  password: String,
  email: String,
});

const Todo = new Schema({
  title: String,
  status: String,
  userid: ObjectId,
});

const Usermodel = mongoose.model("users", User);
const Todomodel = mongoose.model("todos", Todo);

module.exports = {
  Usermodel,
  Todomodel,
};
