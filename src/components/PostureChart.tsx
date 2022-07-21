//@ts-nocheck

//Graph: Moving average of posture over day (good/bad)
//Color coded between red on bottom and green on top. 

import getPostureQualityModel from "tf"

import { tensor } from '@tensorflow/tfjs';

import React, { Component } from 'react';
import { Line } from 'react-chartjs-2'

import { createGradient } from 'postureQualityRendering';

let postureQualityModel;

//Key: unix timestamp
//Value: model evaluation
let graphPoints = new Map()
window.lastEvaluations = []

class PostureChart extends Component<IMyProps, IMyState> {
    constructor(props) {
        super(props);

        //props.sensorName //Sensor key in window.sensors 
        //props.label //Label for y-axis

        this.chartReference = React.createRef();
        this.state = {
            data: {
                labels: [],
                // labels: new Array(24).fill(0).map((a, i) => i),
                datasets: [{
                    label: 'Posture Quality',
                    data: [],
                    // data: new Array(4).fill([65, 100, 80, 81, 22, 0]).flat(),
                    fill: true,
                    borderColor: (context) => {
                        const chart = context.chart;
                        const { chartArea } = chart;

                        if (!chartArea) {
                            return;
                        }
                        return createGradient(chartArea.height, 1);
                    },
                    backgroundColor: (context) => {
                        const chart = context.chart;
                        const { chartArea } = chart;

                        if (!chartArea) {
                            return;
                        }

                        return createGradient(chartArea.height, 0.5);
                    },
                    tension: 0,
                }]
            },
            options: {
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
            }
        }

        getPostureQualityModel().then((model) => {
            postureQualityModel = model
            window.model = postureQualityModel
            window.tensor = tensor

            setInterval(() => {
                let chart = this.chartReference.current
    
                if (!chart) { return }
    
                //   console.log(chart)
    
    
                let dataPointsPerBatch = 64 //TODO: We could always do interim batches. 

                let subBatchRatio = 2 //subBatchRatio sub-batches will be created per full batch. 
                //dataPointsPerBatch should be evenly divisible by subBatchRatio (though it may work even if it isn't)
                //With subBatchRatio=2, half of each batch will overlap the prior. With subBatchRatio=4, 75% will overlap. 
    
    
                // console.time("DataParsing")
    
                //Now we must parse the data and run the model evaluations. 
                //Output rows of CSV. 
                let outputRows = []
    
                let keyOrder = ["acc1", "gyro1", "flex1"]
                let iterators = []
    
                for (let key of keyOrder) {
                    iterators.push(sensors[key].entries())
                }
    
                let latestReadings = iterators.map((iter) => { return iter.next() })
    
                //This code will iterate through the readings and discard readings where all sensors do not report
                //within the same maxMSDelta milliseconds window. 
                let maxMSDelta = 10
                let newestValueTimestamp = -Infinity
    
                mainLoop:
                while (true) {
                    for (let reading of latestReadings) {
                        if (reading.done) { break mainLoop } //We are out of data. 
                    }
    
                    //The first index of each entry is the timestamp. 
                    for (let i = 0; i < latestReadings.length; i++) {
                        let reading = latestReadings[i].value
                        //If this is newer, swap it in. 
                        if (reading[0] > newestValueTimestamp) {
                            newestValueTimestamp = reading[0]
                            continue mainLoop;
                        }
                        //If this is more than maxMSDelta older than newest, replace. 
                        if (newestValueTimestamp - maxMSDelta > reading[0]) {
                            latestReadings[i] = iterators[i].next()
                            continue mainLoop;
                        }
                    }
    
                    //At this point, all the values should be within deltaTimeMS tolerances. 
                    let newRow = [0]
    
                    for (let i = 0; i < latestReadings.length; i++) {
                        let [timestamp, value] = latestReadings[i].value
                        newRow[0] += timestamp
                        newRow.push(value)
                    }
                    newRow[0] /= latestReadings.length
                    newRow[0] = Math.round(newRow[0])
    
                    outputRows.push(newRow)
    
                    //Increment all readings. 
                    latestReadings = iterators.map((iter) => { return iter.next() })
    
    
                }
            //    console.timeEnd("DataParsing")
    
                //We should start at the first item not in graphPoints. 
                //If an item in graphPoints does not exist in the output array, delete it. 
                let startIndex = -1;
                for (let timestamp of graphPoints.keys()) {
                    startIndex = outputRows.findIndex((row) => {
                        return row[0] == timestamp
                    })
                    if (startIndex === -1) {
                        graphPoints.delete(timestamp)
                    }
                }
    
                if (startIndex === -1) {
                    startIndex = 0
                }
                else {
                    startIndex += dataPointsPerBatch / subBatchRatio
                }
    
                for (let i=startIndex;i<outputRows.length - dataPointsPerBatch;i+=dataPointsPerBatch / subBatchRatio) {
                    let tensorLikeArray = []
                    for (let j=i;j<i+dataPointsPerBatch;j++) {
                        let row = outputRows[j]
                        tensorLikeArray.push(row.flat().slice(1))
                    }
                    
                    let dataTensor = tensor([tensorLikeArray])
    
                    console.time("runPredict")
                    let prediction = postureQualityModel.predict(dataTensor)
                    graphPoints.set(outputRows[i][0], prediction.array())
                    prediction.dispose()
                    console.timeEnd("runPredict")

                    dataTensor.dispose()
                }    

                //The only async call here is to the tensors for the output values. We'll just assume that it finishes before the next
                //graphs are drawn. 
                ;(async function() {
                    //Wait on the promises. 
                    for (let key of graphPoints.keys()) {
                        graphPoints.set(key, await graphPoints.get(key))
                    }

                    let labels = Array.from(graphPoints.keys())
                    let predictions = Array.from(graphPoints.values()).map(value => value[0])

                    let datasets = chart.data.datasets
                    for (let i=0;i<datasets.length;i++) {
                        //TODO: We only return value. Make sure to return timestamp as well, else this renders as a timeseries???
                        //Check this. 
                        //We probably need a time library for chartjs to get the correct labelling at the same time as the correct time-based spacing. 
                      datasets[i].data = predictions.map((prediction) => {
                        //Odds of good posture: Sum of confidence in each good posture item. 
                        let sum = prediction[2] + prediction[3] + prediction[5];
                        return sum * 100 //multiply by 100 for posture quality index. 
                      })
                      window.lastEvaluations = datasets[i].data
                    }
      
                    let formattedLabels = labels.map((label) => {
                      label = new Date(label)
                      return `${label.getMinutes()}:${label.getSeconds()}`
                    })
                    chart.data.labels = formattedLabels
      
                    chart.update();
                }())
            }, 1000);
        }, (error) => {
            console.log(error)
            alert("Failed to load AI Model. Cannot render Posture Quality graph. ")
        })    
    }

    render() {
        return (
            <Line ref={this.chartReference} data={this.state.data} options={this.state.options} />
        )
    }
}

export default PostureChart
