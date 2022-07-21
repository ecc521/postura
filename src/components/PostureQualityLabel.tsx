//@ts-nocheck
import React, { Component } from 'react';

import { 
    IonLabel, IonIcon, IonItem, IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonCol, IonGrid, IonRow, IonCard, IonCardContent, IonCardHeader } from '@ionic/react';
  
import { getPostureQualityDetails } from 'postureQualityRendering';

//window.lastEvaluations is the last evaluation of the ml model. Use the final element in this list for the postureQuality value. 

class PostureQualityLabel extends Component<IMyProps, IMyState> {
    constructor(props) {
        super(props);

        //props.sensorName //Sensor key in window.sensors 
        //props.label //Label for y-axis

        // this.reference = React.createRef();
        this.state = {
            postureQuality: undefined
        }

        setInterval(() => {
          this.state.postureQuality = window.lastEvaluations[window.lastEvaluations.length - 1]
          if (this.state.postureQuality !== undefined) {
            this.forceUpdate()
          }
        }, 250); 
    }

    render() {
        return (
            <IonItem>
                <IonLabel style={{ color: getPostureQualityDetails(this.state.postureQuality).color }} id="percentagePostureMeter">
                    {getPostureQualityDetails(this.state.postureQuality).description} Posture ({
                    (this.state.postureQuality === undefined) ? "??" : Math.round(this.state.postureQuality)
                    }/100)
                </IonLabel>
                <IonIcon style={{ color: getPostureQualityDetails(this.state.postureQuality).color }} icon={getPostureQualityDetails(this.state.postureQuality).icon} size="large" slot="end" />
            </IonItem>
        )
    }
}

export default PostureQualityLabel
