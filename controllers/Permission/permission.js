const User = require('./../../models/UserModel/userModel');
const Permission = require('./../../models/Permission/permissionModel');
const catchAsync = require('./../../utils/catchAsync');
const AppError = require('./../../utils/appError');
const moment = require('moment')
const { cloudinary } = require('./../../middleware/cloudnary');

exports.createPermission = catchAsync( async (req, res, next) => {

    let check = await Permission.findOne(req.body);
    if(check) {
      return  res.status(200).json({
            status: 'Failed',
            data: "Permission already given"
        })
    }
    const permission = await Permission.create(req.body);

    res.status(200).json({
        status: 'success',
        data: permission
    })
});

exports.getPermission = catchAsync(async (req, res, next) => {

    if (req.user && req.user.role == 'ADMIN') {
        const permission = await Permission.find({
            permitted: req.query?.permitted
        }).populate('doctor patient');

        res.status(200).json({
            status: 'success',
            data: permission
        })

    }else{
        const permission = await Permission.find({
            $or: [{
                doctor: req.user._id
            }, {
                patient: req.user._id
            }],
            permitted: req.query?.permitted
        }).populate('doctor patient');

        res.status(200).json({
            status: 'success',
            data: permission
        })
    }

    
});

exports.updatePermission = catchAsync(async (req, res, next)=>{
    const {id} = req.params;
    const permission = await Permission.findOneAndUpdate({_id: id}, {...req.body}, {new: true});
    res.status(200).json({
        status: 'success',
        data: permission
    })
})

exports.deletePermission = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const permission = await Permission.findOneAndDelete({ _id: id });
    res.status(200).json({
        status: 'success',
        data: permission
    })
})