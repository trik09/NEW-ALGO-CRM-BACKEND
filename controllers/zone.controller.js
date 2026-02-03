const Zone=require("../models/zone.model");


exports.createZone=async(req,res)=>{
    try {
        const {zone}=req.body;
        const newZone=new Zone({zone});
        await newZone.save();
        res.status(200).json({
            success:true,
            message:"Zone created successfully",
            data:zone
        })
    } catch (error) {
        res.status(500).json({
            success:false,
            message:"Error creating zone",
            error:error.message
        })
    }
}

exports.getAllZone = async (req, res) => {
    try {
        const zones = await Zone.find();
        res.status(200).json({
            success: true,
            data: zones,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching zones",
            error: error.message,
        });
    }
};