const express = require("express") ;
const multer = require("multer") ;
const cors = require("cors") ;
const ffmpeg = require("fluent-ffmpeg") ;
const fs = require("fs") ;
const path = require("path") ;
const app = express() ;
const PORT = process.env.PORT || 3000 ;

// 1. Define your folder paths
const uploads = path.join(__dirname, 'uploads')
const output = path.join(__dirname, 'output')

// 2. List of all folders you need
const foldersToCreate = [uploads, output] ;

// 3. Loop and create if e no dey
foldersToCreate.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
    console.log(`Folder created: ${dir}`)
  } else {
    console.log(`Folder already dey: ${dir}`)
  }
})

app.use(cors()) ;
app.use(express.static("public")) ;
app.use(express.urlencoded({extended : true})) ;




const storage = multer.diskStorage({
    destination : (req , file , cb)=>{
        cb(null , "./uploads") ;
    } , 
    
    filename : (req , file , cb )=>{
        cb(null , Date.now() + "--" + file.originalname) ;
     }
}) ;

const upload = multer({storage : storage}) ;

app.post("/convert" , upload.fields([{name : "video"} , {name : 'picture'}]) , (req , res)=>{
    
  const videoFile = req.files["video"][0].path;
  const imageFile = req.files["picture"][0].path ;
  const customName = req.body.filename ;
  const audioPath = "output/" + Date.now() + ".mp3" ;
  const finalOutput = "output/" + customName + ".mp3" ;
  
  ffmpeg(videoFile)
      .input(imageFile)
      .save(finalOutput)
      .outputOptions(['-map', '0:a',
    '-map', '1:v',
    '-c:a', 'libmp3lame',
    '-c:v', 'mjpeg',
    '-id3v2_version', '3'])
      .on("error" , (err)=>{
          console.error(err) ;
          if (fs.existsSync(videoFile)) fs.unlinkSync(videoFile);
            if (fs.existsSync(imageFile)) fs.unlinkSync(imageFile);
            res.status(500).send("Processing failed.");
      })
      .on("end" , ()=>{
           res.download(finalOutput, `${customName}.mp3`, (err) => {
                if (err) console.error("Download error:", err);
                
                // Cleanup all files after response is finished
                [videoFile, imageFile, finalOutput].forEach(file => {
                    if (fs.existsSync(file)) fs.unlinkSync(file);
                });
            });
      }) ;
})

app.get("/" , (req , res)=>{
  res.send("Hello from my Server");
})

app.listen(PORT , ()=>{
    console.log("Server is Running...") ; 
})
