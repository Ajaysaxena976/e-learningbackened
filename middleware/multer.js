import multer from "multer";
import {v4 as uuid} from "uuid";
const storage=multer.diskStorage({
    //destination is used to define the 
    //destination where our file will be stored
    destination(req,file,callback){
        //callback takes two argument 1 error 2 folder name
        //make sure you have created the uploads folder inside 
        //backend
        callback(null,"uploads");
    },
    filename(req,file,callback){
        //to get the unique file name for all
        //we need the unique id 
        //extract the fileextension
        const id=uuid();
        const extName=file.originalname.split(".").pop();
        const fileName=`${id}.${extName}`;
        // two arguments 1error 2 fileName
        callback(null,fileName);
    }
    
});

export const uploadFiles=multer({storage}).single("file");
