import { 
  IonLabel, IonIcon, IonItem, IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonCol, IonGrid, IonRow, IonCard, IonCardContent, IonCardHeader } from '@ionic/react';

import './Summary.css';
import { alertCircleOutline, closeCircleOutline, checkmarkCircleOutline, checkmarkDoneCircleOutline } from 'ionicons/icons';

// import { Line } from 'react-chartjs-2';

import { Chart as ChartJS, registerables } from 'chart.js';
import { Line } from 'react-chartjs-2'
ChartJS.register(...registerables);

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

let postureLevel = 80

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










const Summary: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Daily Summary</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonGrid>
          <IonRow>
            <IonCol>
              <IonItem>
              <IonLabel style={{color: getPostureQualityDetails(postureLevel).color}} id="percentagePostureMeter">
                {getPostureQualityDetails(postureLevel).description} Posture ({postureLevel}/100)
              </IonLabel>
              <IonIcon style={{color: getPostureQualityDetails(postureLevel).color}} icon={getPostureQualityDetails(postureLevel).icon} size="large" slot="end" />
            </IonItem>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol>
              <IonItem button onClick={() => { }} detail>
                <IonLabel>
                  3000 Steps
                </IonLabel>
              </IonItem>
            </IonCol>
            <IonCol>
              <IonItem button onClick={() => { }} detail>
                <IonLabel>
                  Active 34 Minutes
                </IonLabel>
              </IonItem>
            </IonCol>
          </IonRow>
        </IonGrid>

        <IonCard>
          <IonCardHeader style={{textAlign: "center"}}>Posture Quality</IonCardHeader>
          <IonCardContent>
          <Line
              data={{      
                labels: new Array(24).fill(0).map((a, i) => i),
                datasets: [{
                label: 'Posture Quality',
                data: new Array(4).fill([65, 100, 80, 81, 22, 0]).flat(),
                fill: true,
                borderColor: (context) => {
                  const chart = context.chart;
                  const {ctx, chartArea} = chart;
          
                  if (!chartArea) {
                    return;
                  }
                  return createGradient(chartArea.height, 1);
                },
                backgroundColor: (context) => {
                  const chart = context.chart;
                  const {ctx, chartArea} = chart;
          
                  if (!chartArea) {
                    return;
                  }

                  return createGradient(chartArea.height, 0.5);
                },
                tension: 0,
              }]
            }}
              options={{
                scales: {
                  yAxis: {
                    min: 0,
                    max: 100
                  }
                },
                plugins: {
                  title: {
                    display: false,
                  },
                  legend: {
                    display: false,
                }
                }
              }}
            />
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default Summary;
