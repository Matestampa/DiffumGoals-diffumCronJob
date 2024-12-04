
//const sharp = require('sharp');
const Jimp = require('jimp');

const {GoalModel,MongoDB_Error}=require("../../shared/mongodb");

const {S3_FUNCS}=require("../../shared/aws_services");

const {getBufferAsync}=require("./utils.js");

//------------------------- DB ---------------------------------------------- 

//Trae el arr de pix de la img q esta en la DB
async function get_Img_FromDb(id){
    
    try{
        let doc=await GoalModel.findById(id).select("untouched_pix cant_pix_xday diffum_color s3_imgName");
    }
    catch(e){
        throw new MongoDB_Error("Getting img from DB",e);
    }
    return {untouched_pix:doc.untouched_pix,
           cant_pix_xday:doc.cant_pix_xday,
           diffum_color:doc.diffum_color,
           s3_imgName:doc.s3_imgName};

    //Ver como hacer return de esto --------------------------------------------
}


//Guarda nuevo arr de pix actualizado de la img en la DB
async function save_NewImg_2Db(id,pixelArr,data){
    try{
        await GoalModel.updateOne({_id:id},{$set:{untouched_pix:pixelArr,
            last_diffumDate:new Date()}});  
    }
    catch(e){
        throw new MongoDB_Error("Saving new img to DB",e);
    }
}


//------------------------- S3 ----------------------------------------------

//Obtener array de pixeles e info de la img
/*async function get_ImgFile_Array(imgName){
    
    let imgByteArr=await S3_FUNCS.getObject(imgName);

    let {data,info}=await sharp(imgByteArr).raw().toBuffer({resolveWithObject:true});

    return {image_dataArr:data,imageInfo:info};
}*/

async function get_ImgFile_Array(imgName) {
    // Obtén el objeto de S3 como buffer
    const imgByteArr = await S3_FUNCS.getObject(imgName);

    // Convierte Uint8Array a Buffer
    const imgBuffer = Buffer.from(imgByteArr);

    // Carga la imagen en Jimp
    const img = await Jimp.read(imgBuffer);

    // Obtén el array de píxeles en formato raw
    const image_dataArr = img.bitmap.data; // Buffer de los píxeles
    const imageInfo = {
        width: img.bitmap.width,
        height: img.bitmap.height,
        channels: 4, // Siempre RGBA en Jimp
    };

    return { image_dataArr:image_dataArr, imageInfo:imageInfo};
}

//Guardar la imagen actualizada a partir del nuevo arr de pixeles
/*async function save_NewImgFile(imgName, pixelArr, info) {
    let buffer = await sharp(pixelArr, {
        raw: { width: info.width, height: info.height, channels: info.channels }
    }).toFormat("png").toBuffer();

    await S3_FUNCS.saveObject(imgName, buffer, "image/png");
}*/

async function save_NewImgFile(imgName, pixelArr, info) {
    const { width, height, channels } = info;

    if (channels !== 4) {
        throw new Error("Jimp requiere un formato de imagen RGBA para procesar.");
    }

    // Crear una nueva imagen a partir de los datos de píxeles
    const img = new Jimp({ 
        width, 
        height, 
        data: pixelArr 
    });

    //Convertir la imagen a buffer PNG usando una Promesa
    const buffer = await getBufferAsync(img,Jimp.MIME_PNG);

    // Guardar la imagen en S3
    await S3_FUNCS.saveObject(imgName, buffer, "image/png");
    console.log("Imagen guardada en S3");
}


module.exports={get_Img_FromDb,save_NewImg_2Db,
                get_ImgFile_Array,save_NewImgFile
}