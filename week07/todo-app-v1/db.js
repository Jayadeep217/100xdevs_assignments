const { mongoose, Schema, ObjectId } = require("mongoose");

const userSchema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
  },
  {
    timestamps: true,
  }
);

const todoSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    status: { type: Number },
    userid: {
        type: ObjectId,
        required: true,
        ref: "User"
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
