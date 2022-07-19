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
            borderColor: "#FF0000",
          }, {
            label: 'y',
            borderColor: "#00FF00",
          }, {
            label: 'z',
            borderColor: "#0000FF",
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
          }
          }
        }
      }

    setInterval(() => {
      let chart = this.chartReference.current

      if (!chart) {return}

      let map = window.sensors[props.sensorName]
      let labels = Array.from(map.keys())

      //Delete all data more than maxAge milliseconds old. 
      let maxAge = 1000 * 10
      labels = labels.filter((timestamp) => {
        if (Date.now() - timestamp > maxAge) {
          map.delete(timestamp)
          return false
        }
        return true
      })



      let values = Array.from(map.values())

      //We will convert all values to arrays then map to the corresponding dataset. 
      for (let i=0;i<values.length;i++) {
        if (values[i] instanceof Array) {}
        else {values[i] = [values[i]]}
      }

      if (values?.[0]?.length === 1) {
        chart.options.plugins.legend.display = false;
      }

      let datasets = chart.data.datasets
      for (let i=0;i<datasets.length;i++) {
        let data = values.map((arr) => {
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
