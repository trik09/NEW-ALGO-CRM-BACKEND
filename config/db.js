const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');
// console.log('📌 attachedFiles schema path:', mongoose.model('Tickets').schema.path('attachedFiles'));



    // const Ticket = mongoose.model('Tickets'); // or your model name
    // const latestTicket = await Ticket.findOne().sort({ createdAt: -1 });
    // console.log('Most recent ticket:', latestTicket);


  } catch (err) {
    console.error('MongoDB connection failed', err);
    process.exit(1);
  }
};

module.exports = connectDB;
