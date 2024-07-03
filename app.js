const path = require('path');
const express = require('express');
const app = express();
const fs = require('fs');
const multer = require('multer');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));
const directoryPath=app.use(express.static(path.join(__dirname, 'uploads')));
app.set('views', path.join(__dirname, 'views'));

app.set('view engine', 'ejs');

app.get('/', function (req, res) {
    const directoryPath = path.join(__dirname, 'uploads'); // Path to your files directory
    fs.readdir(directoryPath, function (err, files) {
        res.render('index', {uploads: files }); // Render 'index.ejs' and pass 'files' array as data
    });

})

app.post('/create', function (req, res) {
    const directoryPath = path.join(__dirname, 'files');
    const name = req.body.name;
    const des = req.body.des;
    const filepath = path.join(directoryPath, name);
  
    fs.writeFile(filepath, des, function (err) {
      if (err) {
        console.error("Error writing file:", err);
        return res.status(500).send("Error writing file");
      }
      res.redirect('/');
    });
  });
  

  
 

  

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/') // Uploads directory setup
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname) // Preserve original filename
    },
    limits: {
        fileSize: 10000 * 1024 * 1024,
    },
});
const upload = multer({ storage: storage });




app.post('/upload', upload.array('fileUpload'), function (req, res) {
    // Assuming multiple file uploads
    const uploadedFiles = req.files.map(file => file.filename);
    
    if (uploadedFiles.length > 0) {
        // Redirect to the /read route with the first filename as a query parameter
        res.redirect(`/read?filename=${uploadedFiles[0]}`);
    } else {
        res.redirect('/');
    }
});


app.get('/read', function (req, res) {
    const uploadsDirectory = path.join(__dirname, 'uploads');
    const filename = req.query.filename;
    
    fs.readdir(uploadsDirectory, function (err, uploads) {
        if (err) {
            console.log(err);
            res.status(500).send('Error reading uploads directory');
            return;
        }

        res.render('read', { uploads: uploads, filename: filename });
    });
});
app.get('/read/:files', function (req, res) {  //filename in here is read mores route
    const filename=req.params.files
    const directoryPath = path.join(__dirname, 'uploads',filename); // Path to your files directory
  
    fs.readFile(directoryPath,'utf-8',function(err,filedata){
    res.render('show',{filename:filename,filedata: filedata})
    })
   
  });


  
  app.get('/del/:filename', function (req, res) {
      const filepath = req.params.filename;
  
      const directoryPath = path.join(__dirname, 'uploads',filepath); // Path to your files directory
      fs.unlink(directoryPath, function (err) {
          res.redirect('/read');
      });
    });
  
    app.get('/download/:filename', function (req, res) {
        const filename = req.params.filename; // Get filename from request parameters
    
        // Construct the path to the file in the 'uploads' directory
        const filePath = path.join(__dirname, 'uploads', filename);
    
        // Send the file back to the client
        res.download(filePath, function (err) {
            if (err) {
                // Handle error, such as file not found
                console.error('Error downloading file:', err);
                res.status(404).send('File not found');
            } else {
                // File download successful
                console.log('File downloaded successfully:', filename);
            }
        });
    });
  
  
app.listen(3000)