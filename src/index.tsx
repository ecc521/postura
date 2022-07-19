import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';

import { BleClient } from '@capacitor-community/bluetooth-le';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.unregister();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();


;((async function () {
  let vibration;

  let sensors = {
    acc1: new Map<number, number[]>(),
    acc2: new Map<number, number[]>(),
    gyro1: new Map<number, number[]>(),
    flex1: new Map<number, number>(),
  }

  //@ts-ignore
  window.sensors = sensors

  await BleClient.initialize({
    androidNeverForLocation: true
  })


  let device;
  //Toss this in a loop: On Web, we want it to appear as soon as a user makes a gesture (gestures are required for popup)
  //On android and iOS, we want it to appear until a connection is successfully made (though user assistance documentation
  //and stuff might be good in the future, which would require a connect button instead of an endless loop)
  while (!device) {
    try {
      device = await BleClient.requestDevice({
        services: ['0cfbadd9-2593-4b4e-9bb6-1a459c706000'.toLowerCase()]
      })
    }
    catch (e) {
      if (e instanceof DOMException) {
        //Either user cancelled gesture request or asked for permission before user interacted with page. 
        //Do nothing. 
      }
      else {
        console.error(e)
      }
    }

    await new Promise((resolve, reject) => {setTimeout(resolve, 100)})
  }


  await BleClient.connect(device.deviceId)
  let services = await BleClient.getServices(device.deviceId)

  // BleClient.write(device.deviceId, "0cfbadd9-2593-4b4e-9bb6-1a459c706000", "0cfbadd9-2593-4b4e-9bb6-1a459c706040", new Uint8Array([1]))


  let posturaService = services.find((service) => {
    return service.uuid === "0cfbadd9-2593-4b4e-9bb6-1a459c706000"
  })

  //This should never run as the posturaService uuid should be unique. 
  if (posturaService === undefined) {
    alert("Device is not a Postura device. ")
    throw new Error("Device is not a Postura device. ")
  }

  let characteristics = posturaService.characteristics

  for (let i = 0; i < characteristics.length; i++) {
    let characteristic = characteristics[i];
    let sensor: string;
    if (characteristic.uuid === "0cfbadd9-2593-4b4e-9bb6-1a459c706010") {
      sensor = "acc1"
    }
    else if (characteristic.uuid === "0cfbadd9-2593-4b4e-9bb6-1a459c706011") {
      sensor = "acc2"
    }
    else if (characteristic.uuid === "0cfbadd9-2593-4b4e-9bb6-1a459c706020") {
      sensor = "gyro1"
    }
    else if (characteristic.uuid === "0cfbadd9-2593-4b4e-9bb6-1a459c706030") {
      sensor = "flex1"
    }
    else if (characteristic.uuid === "0cfbadd9-2593-4b4e-9bb6-1a459c706040") {
      vibration = characteristic;
      continue;
    }
    else { continue; }

    // @ts-ignore
    function callback(dv : DataView) {
      let value;
      if (dv.byteLength === 12) {
        value = [dv.getFloat32(0, true), dv.getFloat32(4, true), dv.getFloat32(8, true)]
      }
      else if (dv.byteLength === 1) {
        value = dv.getUint8(0)
      }
      // @ts-ignore
      sensors[sensor].set(Date.now(), value)
    }

    BleClient.startNotifications(device.deviceId, posturaService.uuid, characteristic.uuid, callback)
  }


  // for (let i = 0; i < characteristics.length; i++) {
  //   let characteristic = characteristics[i];
  //   BleClient.stopNotifications(device.deviceId, posturaService.uuid, characteristic.uuid)
  // }
})());
