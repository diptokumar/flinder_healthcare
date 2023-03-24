const User = require('./../../models/UserModel/userModel');
const catchAsync = require('./../../utils/catchAsync');
const AppError = require('./../../utils/appError');
// const moment = require('moment')
var moment = require('moment-timezone');
const { cloudinary } = require('./../../middleware/cloudnary');
const { Api, ApiScope } = require('fitbit-api-handler');
const { default: axios } = require('axios');
const Data = require('./../../models/UserModel/typeDataModel');
const momenttz = require('moment-timezone');
const HeartRate = require('./../../models/UserModel/hearDataModel');
const mongoose = require('mongoose')

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

    const token = await api.requestAccessToken(secretToken, req.user.returnUrl, 360, "profile activity calories distance floors elevation  location and GPS " );
    api.setAccessToken(token.access_token);

    console.log(token, "token")
    console.log(extendedToken);

    // https://www.fitbit.com/oauth2/authorize?response_type=code&client_id=2394Q2&redirect_uri=https://www.flinders.edu.au&scope=activity%20heartrate%20location%20nutrition%20profile%20settings%20sleep%20social%20weight

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
    let callbackurl = api.getLoginUrl(YOUR_RETURN_URL, [ApiScope.ACTIVITY, ApiScope.PROFILE,ApiScope.HEARTRATE, ApiScope.LOCATION, ApiScope.NUTRITION, ApiScope.SETTINGS, ApiScope.SLEEP,ApiScope.SOCIAL, ApiScope.WEIGHT ]);


//    let callbackurl =  `https://www.fitbit.com/oauth2/authorize?response_type=code&client_id=${}&redirect_uri=https://www.flinders.edu.au&scope=activity%20heartrate%20location%20nutrition%20profile%20settings%20sleep%20social%20weight`


    const user = await User.findOneAndUpdate({_id: req.user._id},{
        clientId: clientId,
        clientSecret: clientSecret,
        returnUrl: url,
        // fitbit: true
    });
    res.status(200).json({
        status: 'success',
        data: callbackurl
    });
})

exports.getAccessToken = catchAsync(async (req, res, next) => {
    // global.FormData = require('form-data');

    const {secretToken} = req.body
    const api = new Api(req.user.clientId, req.user.clientSecret );

    const token = await api.requestAccessToken(secretToken, req.user.returnUrl, 360);
    // api.setAccessToken(token.access_token);

    console.log(token, "token")

    const user = await User.findOneAndUpdate({_id: req.user._id},{
        fitbit: true,
        bearerToken: token.access_token,
        refresh_token: token.refresh_token,
        expireDate: token.expireDate
    });
    res.status(200).json({
        status: 'success',
        data: token
    });
})

exports.extendToken = catchAsync(async (req, res, next) => {
    // global.FormData = require('form-data');

    // const {secretToken} = req.body
    if (req.user && req.user.role == 'USER'){
        const api = new Api(req.user.clientId, req.user.clientSecret);

        // api.setAccessToken(token.access_token);
        const extendedToken = await api.extendAccessToken(req.user.refresh_token);
        console.log(extendedToken, "token")

        const user = await User.findOneAndUpdate({ _id: req.user._id }, {
            fitbit: true,
            bearerToken: extendedToken.access_token,
            refresh_token: extendedToken.refresh_token,
            expireDate: extendedToken.expireDate
        });
        res.status(200).json({
            status: 'success',
            data: extendedToken
        });
    }else{

        const userdata = await User.findById(req.query.userid)

        const api = new Api(userdata.clientId, userdata.clientSecret);

        // api.setAccessToken(token.access_token);
        const extendedToken = await api.extendAccessToken(userdata.refresh_token);
        console.log(extendedToken, "token")

        const user = await User.findOneAndUpdate({ _id: userdata._id }, {
            fitbit: true,
            bearerToken: extendedToken.access_token,
            refresh_token: extendedToken.refresh_token,
            expireDate: extendedToken.expireDate
        });
        res.status(200).json({
            status: 'success',
            data: extendedToken
        });
    }

   
})


exports.getDateActivity = catchAsync(async (req, res, next)=> {

  const {date} = req.query;
  let url =  `https://api.fitbit.com/1/user/-/activities/date/${date}.json`;

//   https://api.fitbit.com/1/user/-/activities/date/2023-01-20.json



// let url =  `https://api.fitbit.com/1/user/-/activities/steps/date/today/today/1min.json`;


// let url = `https://web-api.fitbit.com/1/user/B5SMNF/activities/minutesFairlyActive/date/2023-01-23/2023-01-16.json`



  let header = {
    "authorization": `Bearer ${req.user.bearerToken}`
  }

  

  let data = await axios.get(url,{
    headers: header
  });
  
  res.status(200).json({
    status: 'Success',
    data: data.data
  })


})



exports.getIntraDataActivity = catchAsync(async (req, res, next)=> {
    // https://api.fitbit.com/1/user/-/activities/steps/date/2023-01-01/2023-01-01/1min.json

    // https://api.fitbit.com/1/user/-/activities/heart/date/2023-01-01/2023-01-01/1min.json

    const { activityName, startDate, endDate, userid } = req.query;

    let url = `https://api.fitbit.com/1/user/-/activities/${activityName}/date/${startDate}/${endDate}/1min.json`;
    
    // if(dataType == 'intra'){
    //     url = 
    // }else{
    //     url = `https://api.fitbit.com/1/user/-/activities/${activityName}/date/${startDate}/${endDate}/1min.json`
    // }
    
    let header;
    
    if (req.user.role == 'USER'){
        header = {
            "authorization": `Bearer ${req.user.bearerToken}`
        }
    }else{
        let userData = await User.findById(userid)
        header = {
            "authorization": `Bearer ${userData.bearerToken}`
        }
    }


  let data = await axios.get(url,{
    headers: header
  });
//   console.log(header, url, data)

    res.status(200).json({ 
    status: 'Success',
    data: data.data
  })


})


exports.createData = catchAsync(async (req, res, next) => {
    
    
    const {data} = req.body;
    let array = [];
    if (req.user.role == 'USER'){

        for (let index = 0; index < data.length; index++) {
            let obj = {}
            obj.categoryType = data[index].category
            obj.date = data[index].date
            obj.dateString = data[index].date
            obj.value = data[index].value
            obj.userId = req.user._id

            let dataCheck = await Data.findOne({
                userId: req.user._id,
                dateString: data[index].date,
                categoryType: data[index].category
            });

            if (!dataCheck) {
                const createData = await Data.create(obj);

                array.push(createData)
            }

        }
    }else{
        for (let index = 0; index < data.length; index++) {
            let obj = {}
            obj.categoryType = data[index].category
            obj.date = data[index].date
            obj.dateString = data[index].date
            obj.value = data[index].value
            obj.userId = req.query.userid

            let dataCheck = await Data.findOne({
                userId: req.query.userid,
                dateString: data[index].date,
                categoryType: data[index].category
            });

            if (!dataCheck) {
                const createData = await Data.create(obj);

                array.push(createData)
            }

        }
    }
    

    res.status(200).json({
        status: 'Success',
        data: array
    })

})


exports.getDashboardData = catchAsync(async (req, res, next) => {

    let { categoryType, startDate, endDate, userId } = req.query;

    const data = await Data.find({
        categoryType: categoryType,
        userId: mongoose.Types.ObjectId(userId),
        date: {
            '$gte': new Date(momenttz.tz(new Date(startDate), "Asia/Dhaka").format("YYYY-MM-DD 00:00:00")),
            '$lte': new Date(momenttz.tz(new Date(endDate), "Asia/Dhaka").format('YYYY-MM-DD 23:59:59'))
        }
    }).select("categoryType dateString value");

    res.status(200).json({
        status: 'success',
        data: data
    })
})





exports.createHeartRateData = catchAsync(async (req, res, next) => {
    

    const {data} = req.body;
    let array = [];
    if (req.user.role == 'USER'){
    for (let index = 0; index < data.length; index++) {
        let obj = {}
        // obj.categoryType = data[index].category
        obj.date = data[index].dateTime
        obj.dateString = data[index].dateTime
        obj.value = data[index].value
        obj.userId = req.user._id

        console.log({
            userId: req.user._id,
            dateString: data[index].dateTime,
            // categoryType : data[index].category
        })
        let dataCheck = await HeartRate.findOne({
            userId: req.user._id,
            dateString: data[index].dateTime,
            // categoryType : data[index].category
        });


        console.log(dataCheck)

        if (!dataCheck){
            const createData = await HeartRate.create(obj);

            array.push(createData)
        }
        
    }}else{
        for (let index = 0; index < data.length; index++) {
            let obj = {}
            // obj.categoryType = data[index].category
            obj.date = data[index].dateTime
            obj.dateString = data[index].dateTime
            obj.value = data[index].value
            obj.userId = req.query.userid

            console.log({
                userId: req.query.userid,
                dateString: data[index].dateTime,
                // categoryType : data[index].category
            })
            let dataCheck = await HeartRate.findOne({
                userId: req.query.userid,
                dateString: data[index].dateTime,
                // categoryType : data[index].category
            });


            console.log(dataCheck)

            if (!dataCheck) {
                const createData = await HeartRate.create(obj);

                array.push(createData)
            }

        }
    }

    res.status(200).json({
        status: 'Success',
        data: array
    })

})



exports.getDashboardheartData = catchAsync(async (req, res, next) => {

    let { categoryType, startDate, endDate, userId } = req.query;

    const data = await HeartRate.find({
        // categoryType: categoryType,
        userId: mongoose.Types.ObjectId(userId),
        date: {
            '$gte': new Date(momenttz.tz(new Date(startDate), "Asia/Dhaka").format("YYYY-MM-DD 00:00:00")),
            '$lte': new Date(momenttz.tz(new Date(endDate), "Asia/Dhaka").format('YYYY-MM-DD 23:59:59'))
        }
    }).select("categoryType dateString value");

    res.status(200).json({
        status: 'success',
        data: data
    })
})




exports.extendTokenforAll = catchAsync(async (req, res, next) => {
    // global.FormData = require('form-data');

    // const {secretToken} = req.body
    
    let array = [];
    let users = await User.find({ fitbit: true, role: 'USER'});
    for (let index = 0; index < users.length; index++) {
        // const element = array[index];
        console.log(users[index], "users")
        const userdata = await User.findById(users[index]._id)

        const api = new Api(userdata.clientId, userdata.clientSecret);

        // api.setAccessToken(token.access_token);
        const extendedToken = await api.extendAccessToken(userdata.refresh_token).catch((error) => {
            // console.log(error);
            // continue;
        });
        // console.log(extendedToken, "token")
        if (extendedToken === undefined){
            continue;
        }
        const user = await User.findOneAndUpdate({ _id: userdata._id }, {
            fitbit: true,
            bearerToken: extendedToken.access_token,
            refresh_token: extendedToken.refresh_token,
            expireDate: extendedToken.expireDate
        });
        array.push(user)
    }
        
        res.status(200).json({
            status: 'success',
            data: array
        });
    


})
