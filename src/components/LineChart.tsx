//@ts-nocheck

import './LineChart.css';

import React, { Component } from 'react';
import { Line } from 'react-chartjs-2'

class LineChart extends Component<IMyProps, IMyState> {
  constructor(props: {label: string, sensorName: string}) {
    super(props);
    
    //props.sensorName //Sensor key in window.sensors 
    //props.label //Label for y-axis

    this.chartReference = React.createRef();
    this.state = {
        data: {
          //TODO: Consider removing backgroundColor and fill properties. 
          datasets: [{
            label: 'x',
            borderColor: "#cc0000",
          }, {
            label: 'y',
            borderColor: "#00cc00",
          }, {
            label: 'z',
            borderColor: "#0000cc",
          }]
        },
        options: {
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: props.title
            },
            legend: {
              display: true,
              labels: {
                boxWidth: 10,
              }
          }
          }
        }
      }

    setInterval(() => {
      let chart = this.chartReference.current

      if (!chart) {return}

      let map = window.sensors[props.sensorName]

      let labels = []
      let values = []

      let maxAge = 1000 * 10 //Use maxAge milliseconds of data. 
      let minInterval = 500 //Require at least minInterval milliseconds between displayed points (greatly reduces animation CPU costs)

      let previousTimestamp;
      for (let timestamp of map.keys()) {
        if (Date.now() - timestamp > maxAge) {
          //Value too old. 
          continue;
        }
        else if (timestamp - previousTimestamp < minInterval) {
          //Value too close to previous value. 
          //TODO: Never drop the most recent value. 
          continue;
        }

        previousTimestamp = timestamp
        labels.push(timestamp)
        let value = map.get(timestamp)

        //Reformat value to an array (makes it easier to correspond into datasets)
        if (!(value instanceof Array)) {
          value = [value]
        }

        values.push(value)
      }

      if (values?.[0]?.length === 1) {
        chart.options.plugins.legend.display = false;
      }

      let datasets = chart.data.datasets
      for (let i=0;i<datasets.length;i++) {
        let data = values.map((arr) => {
          //TODO: We only return value. Make sure to return timestamp as well, else this renders as a timeseries???
          //Check this. 
            return arr[i]
        })
        datasets[i].data = data
      }

      let formattedLabels = labels.map((label) => {
        label = new Date(label)
        return `${label.getMinutes()}:${label.getSeconds()}`
      })
      chart.data.labels = formattedLabels

      chart.update();
    }, 1000); 
  }

  render() {
    return (
      <Line className="miniGraph" ref={this.chartReference} data={this.state.data} options={this.state.options} />
    )
  }
}

export default LineChart
