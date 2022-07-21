//@ts-nocheck

//Tensorflow
//TODO: Use native tensorflow on iOS and Android for better performance. 

import {loadLayersModel} from '@tensorflow/tfjs';
let model = loadLayersModel('models/tfjs_posture/model.json'); //This is a Promise!

async function getPostureQualityModel() {
    model = await model
    return model
}

export default getPostureQualityModel