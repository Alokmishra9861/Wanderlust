    if(process.env.NODE_ENV !="production"){
        require('dotenv').config();
    };
    
    const express=require("express");
        const app=express();
        const mongoose=require("mongoose");
        const path=require("path");
        const methodOverride=require("method-override");
        const ejsMate = require('ejs-mate');
        const ExpressError=require("./utils/ExpressError.js");
        const session=require("express-session");
        const MongoStore = require('connect-mongo');
        const flash=require("connect-flash");
        const passport=require("passport");
        const LocalStrategy=require("passport-local");
        const User=require("./models/user.js");

        const listingRouter=require("./routes/listing.js");
        const reviewRouter=require("./routes/review.js");
        const userRouter=require("./routes/user.js");
        const searchRouter=require("./routes/search.js");
        
        const listingController=require("./controllers/listings.js");
        
        const dbUrl=process.env.ATLASDB_URL;
        
        main()
        .then(()=>{
            console.log("connected to DB");
        }).catch((err)=>{
            console.log(err);
        })

        async function main(){
        await mongoose.connect(dbUrl);
        // console.log("DB URL:", process.env.ATLASDB_URL); 
        await mongoose.connect(process.env.ATLASDB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        ssl: true
        });
        }

        // 1. Set custom EJS engine first
        app.engine("ejs", ejsMate);

        // 2. Then set view engine and views folder
        app.set('view engine', 'ejs');
        app.set('views', path.join(__dirname, 'views'));

        // 3. Then other middlewares
        app.use(express.static(path.join(__dirname, "/public")));
        app.use(express.urlencoded({ extended: true }));
        app.use(methodOverride("_method"));

        const store=MongoStore.create({
            mongoUrl:dbUrl,
            crypto:{
                secret:process.env.SECRET,
            },
            touchAfter:24*3600,
        });

        const sessionOptions={
            store,
            secret:process.env.SECRET,
            resave:false,
            saveUninitialized:true,
            cookie: {
            expires: Date.now() + 7* 24 * 60 * 60 *1000,
            maxAge: 7* 24 * 60 * 60 * 1000,
            httpOnly:true,
            },
        };

        //   app.get("/",(req,res)=>{
        //     res.send("hi i am root");
        // });

        app.use(session(sessionOptions));
        app.use(flash());

        app.use(passport.initialize());
        app.use(passport.session());
        passport.use(new LocalStrategy(User.authenticate()));

        passport.serializeUser(User.serializeUser());
        passport.deserializeUser(User.deserializeUser());

        app.use((req,res,next)=>{
            res.locals.success=req.flash("success");
            res.locals.error=req.flash("error");
            res.locals.currUser=req.user;
            next();
        });

        // app.get("/demouser",async(req,res)=>{
        //     let fakeUser=new User({
        //         email:"abc@gmail.com",
        //         username:"Delta-student"
        //     });
        //     let registeredUser=await User.register(fakeUser,"helloworld");
        //     res.send(registeredUser);
        // });
        app.use("/",searchRouter);
        app.use("/listings",listingRouter);
        app.use("/listings/:id/review",reviewRouter);
        app.use("/",userRouter);
        app.all(/.*/,(req, res, next)=>
        {
            next(new ExpressError(404, "page not found!"));
        });

        //err handling middleware
        app.use((err , req , res ,next)=>{
            let {statusCode=500, message="something went wrong"}=err;
            // res.status(statusCode).send(message);
            res.status(statusCode).render("error.ejs",{ message });
        });

        app.listen(8080,()=>{
            console.log("listening to port 8080");
        });
