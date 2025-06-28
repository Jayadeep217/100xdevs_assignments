const { mongoose, Schema, ObjectId } = require("mongoose");

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

const todoSchema = new Schema(
  {
    title: String,
    description: String,
    status: Number,
    userid: {
      type: ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("users", userSchema);
const Todo = mongoose.model("todos", todoSchema);

module.exports = {
  User,
  Todo,
};
