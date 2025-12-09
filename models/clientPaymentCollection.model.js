const mongoose = require('mongoose');


// const ClientpaymentCollectionSchema = new mongoose.Schema({


//        description:{
//         type:String,
//         default: ""
//        } ,
//        transaction_posted_date :{
//         type :Date,
//        },

//        excelTransactionId:{
//               type: String,


//        },
       
//        // Amount we get from client  
//        transaction_amount:{
//         type: Number,
//        },
//        invoiceDate :{
//       type: Date,
//        },
//        invoiceNo:{
//         type: Number,
//        },
//        qstClient:{
//          type: mongoose.Schema.Types.ObjectId,
//          ref: 'QstClient',
//        //    required: true
//        }
     
// },{timestamps:true})


// module.exports =   mongoose.model('ClientpaymentCollection', ClientpaymentCollectionSchema);







const ClientpaymentCollectionSchema = new mongoose.Schema({

       description:{
        type:String,
        default: ""
       } ,
       transaction_posted_date :{
        type :Date,
       },

       excelTransactionId:{
              type: String,


       },
       
       // Amount we get from client  
       transaction_amount:{
        type: Number,
       },
       invoiceDate :{
      type: Date,
       },
       invoiceNo:{
        type: Number,
       },
       qstClient:{
         type: mongoose.Schema.Types.ObjectId,
         ref: 'QstClient',
       //    required: true
       },

       // 🆕 Store which matching method was used: "exact", "firstToken", "token", "substring"
  matchMethod: {
    type: String,
    enum: ["exact", "firstToken", "token", "substring", null],
    default: null
  },

  // 🆕 Store the actual company name found in DB for traceability
  matchedCompanyName: {
    type: String,
    default: ""
  },

  paymentDetails: {
    type: {
      razorpay_payment_id: { type: String, default: null },
      razorpay_order_id: { type: String, default: null },
      razorpay_signature: { type: String, default: null },
      amountPaid: { type: Number, default: null }, // Actual amount paid in ₹
      originalAmount: { type: Number, default: null }, // Full ticket/invoice amount
      paymentGateway: { type: String, default: null } // "Razorpay", "Cash", "Paytm", etc.
    },
    default: null
  },

     
},{timestamps:true})


module.exports =   mongoose.model('ClientpaymentCollection', ClientpaymentCollectionSchema);