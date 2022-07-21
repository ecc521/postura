import { IonButton, IonContent, IonHeader, IonItem, IonLabel, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import './Details.css';

const Details: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Details</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
{/* TODO: When start recording clicked, clear all Maps in sensors */}
{/* We want to refractor the outputRows code out of Summary.tsx into a seperate file where we can use it as well. */}
          <IonItem>
            <IonLabel className="ion-text-wrap">
            Welcome to the sample recording tool. Click the "Start Recording" button below to begin collecting samples. 
            </IonLabel>
          </IonItem>

          <IonButton color="primary" expand="full">Primary</IonButton>



        {/* <IonItem button onClick={() => { }}>
          <IonLabel>
            Button Item
          </IonLabel>
        </IonItem> */}
        
      </IonContent>
    </IonPage>
  );
};

export default Details;
