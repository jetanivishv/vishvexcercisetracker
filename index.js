const express = require('express')
const app = express()
const mongodb=require('mongodb').MongoClient;
const mongoose = require('mongoose');
var bodyParser=require('body-parser');
const cors = require('cors')
require('dotenv').config()

mongoose.connect(process.env.MONGO_URI,{
  useNewUrlParser: true,
  useUnifiedTopology: true
})

const userSchema=new mongoose.Schema({
  username:{
    type: 'string',
    required: true
  },
},
{
  versionKey:false
}
);

const excerciseSchema=new mongoose.Schema({
  userId:{
    type:mongoose.Types.ObjectId,
    required: true,
    ref:"user"
  },
  description:String,
  duration:{
    type:Number,
    min:0,
  },
  date:{
    type:Date,
    default:Date.now
  }
},
{
  versionKey:false
}
)

const user=mongoose.model('user',userSchema);
const excercise=mongoose.model('excercise',excerciseSchema);

app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/users',(req,res) => {
  var name=req.body.username;
  var user1=new user({
    username:name
  });
  user1.save((err,docs)=>{
    if(err){
      console.log(err)
    }
    else{
      res.json(docs);
    }
  })
})

app.get('/api/users',(req,res)=>{
  user.find((err,docs)=>{
    if(err){
      console.log(err);
    }
    else{
      res.json(docs);
    }
  })
});

app.post('/api/users/:_id/exercises',(req,res)=>{
  var userId=req.params._id;
  var description=req.body.description;
  var duration=req.body.duration;
  var date=req.body.date;
 
  var excercise1=new excercise({
    userId:userId,
    description:description,
    duration:duration,
    date:date
  });
  excercise1.save((err,docs)=>{
    if(err){
      console.log(err);
    }
    else{
      user.find({_id:userId},(err,docs2)=>{
        if(err){
          console.log(err);
        }
        else{
          var resp={};
          resp["_id"]=userId;
          resp["username"]=docs2[0].username;
          resp["date"]=(docs.date).toDateString();
          resp["duration"]=docs.duration;
          resp["description"]=docs.description;
          res.json(resp);
        }
      })
    }
  })
})

app.get("/api/users/:id/logs?",(req,res)=>{
  let id=req.params.id;
  excercise.find({userId:id},(err,logs)=>{
    if(err){
      console.log(err);
    }
    else{
      user.find({_id:id},'username',(err,doc)=>{
        if(err){
          console.log(err);
        }
        else{
          if((req.query.from) && (req.query.to)){
            logs=logs.filter((d)=>(Date.parse(d.date)>=Date.parse(req.query.from)) && (Date.parse(d.date)<=Date.parse(req.query.to)))
          }
          if(req.query.limit){
            logs=logs.filter((d,i)=>i<req.query.limit);
          }
            var resp={};
            var logsa=[];
            var logo={};
            for(let i of logs){
              logo["description"]=i.description;
              logo["duration"]=i.duration;
              logo["date"]=(i.date).toDateString();
              logsa.push(logo);
            }
            resp["_id"]=id;
            resp["username"]=doc[0].username;
            resp["count"]=logs.length;
            resp["log"]=logsa;
            res.json(resp);
        }
      })
    }
  })
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
