if(process.env.NODE_ENV !=="production"){
    require("dotenv").config();
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require("ejs-mate");
const ExpressError=require("./utils/ExpressError");
const methodOverride = require('method-override');

const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user");
const helmet=require("helmet");

//importing session so i dont use the local storage
//const MongoDBStore=require("connect-mongo")(session);

const mongoSanitize=require("express-mongo-sanitize");

const userRoutes=require("./routes/users");
const campgroundRoutes =require("./routes/campgrounds");
const reviewsRouter=require("./routes/reviews.js");
const dbUrl=process.env.DB_URL||'mongodb://localhost:27017/yelp-camp';

//'mongodb://localhost:27017/yelp-camp'

mongoose.connect(dbUrl);
const session = require('express-session');
const MongoStore = require('connect-mongo');


const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

app.engine("ejs", ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(mongoSanitize());

/***const store=new MongoDBStore({
    url:'mongodb://localhost:27017/yelp-camp',
    secret:"thisshouldbeabettersecret",
    touchAfter:24*60*60,
});
store.on("error",function(e){
    console.log("Session store error ",e);
})

const sessionConfig={
    store,
    name:"session",
    secret:"thisshouldbeabettersecret",
    resave:false,
    saveUninitialized:true,
    cookie:{
        httpOnly:true,
        expires:Date.now() + 1000*60*60*24*7,
        age:60*60*24*7
    }
    
}***/

const secret=process.env.SECRET||"thisshouldbeabettersecret";

app.use(express.static(path.join(__dirname,"public")));
app.use(session({
    store:MongoStore.create({
       mongoUrl:dbUrl,
    }),
    name:"session",
    secret,
    resave:false,
    saveUninitialized:true,
    cookie:{
        httpOnly:true,
        expires:Date.now() + 1000*60*60*24*7,
        age:60*60*24*7
    }
}));
app.use(flash());


//Using passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//Using flash=>defining a middleware that looks for either success or failure so that success and error can be passed on res.render()
app.use((req,res,next)=>{
    //console.log(req.session.returnTo);
    res.locals.currUser = req.user;
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    next();
})

app.get("/fakeUser",async(req,res)=>{
    const user = new User({email:"boioboi@yahoo.com",username:"hulcutJawaani"});
    const newUser=await User.register(user,"chicken");
    res.send(newUser);
})

app.use("/",userRoutes);
app.use("/campgrounds",campgroundRoutes);
app.use("/campgrounds/:id/reviews",reviewsRouter);

app.get('/', (req, res) => {
    res.render('home')
});


app.all("*",(req,res,next)=>{  
       next(new ExpressError("Page Not Found", 404));
    }
)

app.use((err,req,res,next)=>{
    const {statusCode=500} = err;
    if(!err.message) err.message="Oh No , Something Went Wrong!";
    res.status(statusCode).render("error",{err});
})

const port=process.env.PORT||3000;
app.listen(port, () => {
    console.log(`Serving on port ${port}`);
})