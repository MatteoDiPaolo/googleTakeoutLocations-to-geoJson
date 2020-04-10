# Description

This node script is intended to be used in order to translate Google takeout locations history to geojson

- What is GeoJson? --> [read here](https://geojson.org/)
- What is Google location history? --> [read here](https://support.google.com/accounts/answer/3118687?hl=en)
- Where can I get my Google account location history? --> [look here](https://takeout.google.com/settings/takeout/custom/location_history?pli=1)


### Google location history archive
- __`.zip`__ archive
    - __`.html`__ info file
    - locations history folder
        - __`.json`__ locations history file


### Google location history json file

```json
{
  "locations": [
    {
      "timestampMs": "1507330772000",
      "latitudeE7": 419058658,
      "longitudeE7": 125218684,
      "accuracy": 16,
      "velocity": 0,
      "altitude": 66,
      "activity": [
        {
          "timestampMs": "1507049587082",
          "activity": [
            {
              "type": "TILTING",
              "confidence": 100
            }
          ]
        },
        {
          "timestampMs": "1507049736368",
          "activity": [
            {
              "type": "IN_VEHICLE",
              "confidence": 33
            },
            {
              "type": "STILL",
              "confidence": 33
            },
            {
              "type": "UNKNOWN",
              "confidence": 17
            },
            {
              "type": "ON_FOOT",
              "confidence": 12
            },
            {
              "type": "WALKING",
              "confidence": 12
            },
            {
              "type": "ON_BICYCLE",
              "confidence": 6
            }
          ]
        }
      ]
    }
  ]
}
```


### Google location history in GeoJson format

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [
          12.5218684,
          41.9058658
        ]
      },
      "properties": {
        "timestamp": "2017-10-06T22:59:32.000Z",
        "accuracy": 16,
        "velocity": null,
        "altitude": 66
      }
    }
  ]
}
```


# Install

- `npm i`


# Test

- `npm run test`


# Run

- Copy one or more Google location history json files inside the `./input` folder
- `npm run start [-- fromTimestampMs toTimestampMs]`
- Access the GeoJson files results of the translation inside the `./output` folder


## Params

You can optionally set a time range window in order to filter locations out of the output.<br>
Timestamp parameters must be defined as milliseconds epoch timestamps.
- __fromTimestampMs__: lower bound timestamp 
- __toTimestampMs__: upper bound timestamp 

Note that you can as well set only one of the two bounds either the lower or the upper one


## Examples
1. Translate files without applying time filtering
    - `npm run start`
2. Maintain only locations with timestamp between __Tuesday, 1 January 2019 00:00:00__ and __Tuesday, 31 December 2019 23:59:59__
    - `npm run start -- 1546300800000 1577836799000`
3. Maintain only locations with timestamp subsequent to __Tuesday, 1 January 2019 00:00:00__ 
    - `npm run start -- 1546300800000`
4. Maintain only locations with timestamp prior to __Tuesday, 31 December 2019 23:59:59__ 
    - `npm run start -- x 1577836799000`


# Exectution example output


## Input folder content
- empty.json
- 1_locations.json
- 4_locations.json


## Process logs

![alt text](https://github.com/MatteoDiPaolo/GoogleTakeoutLocations_to_GeoJson/raw/master/README.png)