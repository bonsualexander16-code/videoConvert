const express = require("express") ;
const multer = require("multer") ;
const cors = require("cors") ;
const ffmpeg = require("fluent-ffmpeg") ;
const fs = require("fs") ;
const path = require("path") ;
const app = express() ;

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

app.listen(2000 , ()=>{
    console.log("Server is Running...") ; 
})
