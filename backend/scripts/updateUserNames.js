const mongoose = require("mongoose");
const User = require("../models/User"); // Adjust the path as needed

const updateUserNames = async () => {
  try {
    // Connect to the database
    await mongoose.connect("mongodb+srv://sparshgoelk:kK3TzpanXDr5iugD@cluster0.md7ur9m.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to the database");

    // Update users with missing names
    const result = await User.updateMany(
      { name: { $exists: false } }, // Find users without a name
      { $set: { name: "Default Name" } } // Set a default name
    );

    console.log(`Updated ${result.nModified} users with a default name`);
  } catch (error) {
    console.error("Error updating user names:", error);
  } finally {
    mongoose.connection.close();
  }
};

updateUserNames();