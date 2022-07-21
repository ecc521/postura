import { 
  IonLabel, IonIcon, IonItem, IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonCol, IonGrid, IonRow, IonCard, IonCardContent, IonCardHeader } from '@ionic/react';

import './Summary.css';

import { Chart as ChartJS, registerables } from 'chart.js';
// import { Line } from 'react-chartjs-2'

import { getPostureQualityDetails } from 'postureQualityRendering';

import LineChart from '../components/LineChart';
import PostureChart from '../components/PostureChart';
import PostureQualityLabel from 'components/PostureQualityLabel';

import postureQuality from "../tf"
//@ts-ignore
window.postureQuality = postureQuality

ChartJS.register(...registerables);


const Summary: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Live Data</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonGrid>
          <IonRow>
            <IonCol>
              <PostureQualityLabel />
              {/* <IonItem>
              <IonLabel style={{color: getPostureQualityDetails(undefined).color}} id="percentagePostureMeter">
                {getPostureQualityDetails(undefined).description} Posture ({"??"}/100)
              </IonLabel>
              <IonIcon style={{color: getPostureQualityDetails(undefined).color}} icon={getPostureQualityDetails(undefined).icon} size="large" slot="end" />
            </IonItem> */}
            </IonCol>
          </IonRow>
          {/* <IonRow>
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
          </IonRow> */}
        </IonGrid>

        <IonCard>
          <IonCardHeader style={{textAlign: "center"}}>Posture Quality</IonCardHeader>
          <IonCardContent>
            <PostureChart />
          </IonCardContent>
        </IonCard>


        <IonGrid>
          <IonRow>
            <IonCol>
              <LineChart title="Accelerometer 1 (m/s^2)" sensorName="acc1" />
            </IonCol>
            <IonCol>
              <LineChart title="Accelerometer 2 (m/s^2)" sensorName="acc2" />
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol>
              <LineChart title="Gyroscope 1 (degrees/second)" sensorName="gyro1" />
            </IonCol>
            <IonCol>
              <LineChart title="Flex Sensor 1 (degrees bend)" sensorName="flex1" />
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Summary;
