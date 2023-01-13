const User = require('./../../models/UserModel/userModel');
const catchAsync = require('./../../utils/catchAsync');
const AppError = require('./../../utils/appError');
// const moment = require('moment')
var moment = require('moment-timezone');
const { cloudinary } = require('./../../middleware/cloudnary');
const { Api, ApiScope } = require('fitbit-api-handler');

exports.createUsers = catchAsync(async (req, res, next) => {
    if(req.files === null){
        const user = await User.create({...req.body,
            
        });
        res.status(201).json({
            status: 'success',
            data: user
        })
    }else{
   
    const fileStr = req.files.image;

    let result = await cloudinary.uploader.upload(fileStr.tempFilePath, {
		public_id: `${Date.now()}`,
		resource_type: "auto", //jpeg,png
	});
    const user = await User.create({...req.body,
        image: result.secure_url,
    });
    res.status(201).json({
        status: 'success',
        data: user
    })}
})

exports.getAllUsers = catchAsync(async (req, res, next) => {
    let {pageNo, limit, role, search} = req.query;
    let value = (parseInt(pageNo) - 1) * parseInt(limit);
    let startIndex = value > 0 ? value : 0;
    let object = {};
    if(role != null && role.length > 0){
        object.role = role;
    }

    if(search != null && search.length > 0){
        object = {};
        object['$or'] = [ { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
     ];
    }

    const users = await User.find(object).sort({createdAt: -1})
    .skip(startIndex).limit(parseInt(limit));
    res.status(200).json({
        status: 'success',
        length: users.length,
        data: users
    });
})

exports.updateUser = catchAsync(async (req, res, next) => {
    let {id} = req.params;
    if(req.files === null){
        const user = await User.findOneAndUpdate({_id: id},{...req.body,
            
        },{new: true});
        res.status(201).json({
            status: 'success',
            data: user
        })
    }else{
   
    const fileStr = req.files.image;

    let result = await cloudinary.uploader.upload(fileStr.tempFilePath, {
		public_id: `${Date.now()}`,
		resource_type: "auto", //jpeg,png
	});
    const user = await User.findOneAndUpdate({_id: id},{...req.body,
        image: result.secure_url,
    },{new: true});
    res.status(201).json({
        status: 'success',
        data: user
    })}
})

exports.getSingleUser = catchAsync(async (req, res, next) => {
    let {id} = req.params;
    
    const user = await User.findById(id);
    res.status(200).json({
        status: 'success',
        data: user
    });
})


exports.deleteUser = catchAsync(async (req, res, next) => {
    let {id} = req.params;
    
    const user = await User.findOneAndDelete({_id: id});
    res.status(200).json({
        status: 'success',
        data: user
    });
})



exports.dataFetch = catchAsync(async (req, res, next) => {

    const {secretToken} = req.body




    const api = new Api(req.user.clientId, req.user.clientSecret );

    const token = await api.requestAccessToken(secretToken, req.user.returnUrl);
    api.setAccessToken(token.access_token);

// extend your token
const extendedToken = await api.extendAccessToken(token.refresh_token);

const { DateTime } = require('luxon');

const { activities } = await api.getActivities({
    afterDate: DateTime.fromObject({
        year: 2022,
        month: 3,
        day: 1,
    }),
});
    res.status(200).json({
        status: 'success',
        data: activities
    });
})


exports.generateUrl = catchAsync(async (req, res, next) => {
    // global.FormData = require('form-data');

    const {clientId, clientSecret, url} = req.body
    
    
    let YOUR_CLIENT_ID = clientId
    let YOUR_CLIENT_SECRET = clientSecret
    let YOUR_RETURN_URL = url
    
    const api = new Api(YOUR_CLIENT_ID, YOUR_CLIENT_SECRET);
    let callbackurl = api.getLoginUrl(YOUR_RETURN_URL, [ApiScope.ACTIVITY, ApiScope.PROFILE]);


    const user = await User.findOneAndUpdate({_id: req.user._id},{
        clientId: clientId,
        clientSecret: clientSecret,
        returnUrl: url,
        fitbit: true
    });
    res.status(200).json({
        status: 'success',
        data: callbackurl
    });
})