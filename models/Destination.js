const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const DestinationSchema = new Schema({
  title: {
    type: String,
    unique: true
  },
  subtitle: {
    type: String
  },
  image: {
    type: String
  },
  url: {
    type: String
  },
  notes: [
    {
      type: Schema.Types.ObjectId,
      ref: "Note"
    }
  ]
});
const Destination = mongoose.model("Destination", DestinationSchema);
// Export the User model
module.exports = Destination;
