const { mongoose, Schema, ObjectId } = require("mongoose");

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

const todoSchema = new Schema({
  title: String,
  description: String,
  status: Number,
  userid: ObjectId,
});

const User = mongoose.model("users", userSchema);
const Todo = mongoose.model("todos", todoSchema);

module.exports = {
  User,
  Todo,
};
