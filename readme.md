### Installation

Make sure to set flags as required by https://github.com/capacitor-community/bluetooth-le
- IOS requires a message explaining what bluetooth is used for. (We use "Bluetooth is used to connect and sync with your wearable device. ")
- Android requires a declaration that scanning never used for location, or location permissions to be requested. 


# Build Assets
Run 
```
cordova-res ios --skip-config --copy
cordova-res android --skip-config --icon-background-source #022145
```

May need to change background attribute in ic_launcher_round.xml to point to correct place

Need to set NSBluetoothAlwaysUsageDescription for iOS (in info.plist)