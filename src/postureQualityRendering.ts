import { alertCircleOutline, closeCircleOutline, checkmarkCircleOutline, checkmarkDoneCircleOutline } from 'ionicons/icons';

let postureLevels = {
    excellent: 85,
    good: 70,
    medicore: 40,
    poor: 0
  }
  
  //Posture quality is measured on a 0-100 scale.
  
  function getPostureQualityDetails(postureQuality : number) : {color: string, description: string, icon: string} {
    let obj : {color: string, description: string, icon: string} = {
      color: "",
      description: "",
      icon: ""
    }
  
    //Hue component of HSL colors ranges from 0 to 120.
    obj.color = `hsl(${Math.round(postureQuality * 1.2)}, 100%, 24%)`
  
    if (postureQuality >= postureLevels.excellent) {
      obj.description = "Excellent"
      obj.icon = checkmarkDoneCircleOutline
    }
    else if (postureQuality >= postureLevels.good) {
      obj.description = "Good"
      obj.icon = checkmarkCircleOutline
    }
    else if (postureQuality >= postureLevels.medicore) {
      obj.description = "Medicore"
      obj.icon = alertCircleOutline
    }
    else {
      obj.description = "Poor"
      obj.icon = closeCircleOutline
    }
  
    return obj
  }


//Graph: Moving average of posture over day (good/bad)
//Color coded between red on bottom and green on top. 

let canvas = document.createElement("canvas")
let ctx = canvas.getContext("2d")

function createGradient(height : number, opacity : number) {
  let gradient : CanvasGradient | undefined;

  if (ctx != null) {
    //ctx should almost never be null, as a rendering context should always be created. 
     //TODO: The height must be exactly equal to the graph area. 
    gradient = ctx.createLinearGradient(0, height, 0, 0);
    for (let i=0;i<=100;i++) {
      gradient.addColorStop(i/100, getPostureQualityDetails(i).color
        .replace("rgb", "rgba")
        .replace(")", `, ${opacity})`)
      )
    }
  }
  return gradient
}




export {
    createGradient,
    getPostureQualityDetails
}