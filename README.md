# Description

This node script is intended to be used in order to translate Google takeout locations history to geojson.

- What is GeoJson? --> [read here](https://geojson.org/)
- What is Google location history? --> [read here](https://support.google.com/accounts/answer/3118687?hl=en)
- Where can I get my Google account location history? --> [look here](https://takeout.google.com/settings/takeout/custom/location_history?pli=1)


### Google location history archive

What follows is the content structure of a Google location history archive:
- __`.zip`__ archive
    - __`.html`__ info file
    - locations history folder
        - __`.json`__ locations history file


### Google location history json file

A basic example of an input file
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

A basic example of an output file
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


# Stream based approach
Even if the transformation is straightforward it is not possible to achieve it using a simple array map because of the huge amount of data to manage. 


### Error arising without using streams

- File: **_2.json_**
- Size: __1.16 GB__
- Error message: __Cannot create a string longer than 0x3fffffe7 characters__
- Error code: __ERR_STRING_TOO_LONG__

Node cannot buffer the file for us because: 
- the size of the file is bigger than the maximum one Node.js itself is capable of creating a string for.
- the size of the file is bigger than the maximum one Node.js is able to store in memory at once.


### Stream solution

Defined in the [streamProcessing](https://github.com/MatteoDiPaolo/GoogleTakeoutLocations_to_GeoJson/blob/master/src/lib/streamProcessing.js) file.

1. ![#82B366](https://placehold.it/15/82B366/000000?text=+) __[Read]__ --- **_fileToStream_** --> Input file to stream.
2. ![#D6B656](https://placehold.it/15/D6B656/000000?text=+) __[Transform]__ --- **_streamParser_** --> Consumes text, and produces a stream of data items corresponding to high-level tokens.
3. ![#D6B656](https://placehold.it/15/D6B656/000000?text=+) __[Transform]__ --- **_streamPicker_** --> Is a token item filter, it selects objects from a stream ignoring the rest and produces a stream of objects (_locations_ in our case).
4. ![#D6B656](https://placehold.it/15/D6B656/000000?text=+) __[Transform]__ --- **_streamArrayer_** --> It assumes that an input token stream represents an array of objects and streams out assembled JavaScript objects (locations in our case).
5. ![#D6B656](https://placehold.it/15/D6B656/000000?text=+) __[Transform]__ --- **_streamGeoJsoner_** --> It transforms google takeout locations into GeoJson locations.
6. ![#D6B656](https://placehold.it/15/D6B656/000000?text=+) __[Transform]__ --- **_streamStringer_** --> It stringifies GeoJson locations.
7. ![#B85450](https://placehold.it/15/B85450/000000?text=+) __[Write]__ --- **_streamToFile_** --> Stream to Output file.

![alt text](https://github.com/MatteoDiPaolo/GoogleTakeoutLocations_to_GeoJson/raw/master/README_1.png)


# Prerequisites

- `node v13.7.0`


# Install

- `npm i`


# Test

- `npm run test`


# Run

- Copy one or more Google location history json files inside the `./input` folder.
- `npm run start [-- fromTimestampMs toTimestampMs]`
- Access the GeoJson files results of the translation inside the `./output` folder.


### Params

You can optionally set a time range window in order to filter locations out of the output.<br>
Timestamp parameters must be defined as milliseconds epoch timestamps.
- __fromTimestampMs__: lower bound timestamp. 
- __toTimestampMs__: upper bound timestamp. 

Note that you can as well set only one of the two bounds either the lower or the upper one.


### Examples
1. Translate files without applying time filtering:
    - `npm run start`
2. Maintain only locations with timestamp between __Tuesday, 1 January 2019 00:00:00__ and __Tuesday, 31 December 2019 23:59:59__:
    - `npm run start -- 1546300800000 1577836799000`
3. Maintain only locations with timestamp subsequent to __Tuesday, 1 January 2019 00:00:00__: 
    - `npm run start -- 1546300800000`
4. Maintain only locations with timestamp prior to __Tuesday, 31 December 2019 23:59:59__: 
    - `npm run start -- x 1577836799000`


# Exectution example output


### Input folder content
- __1_locations.json__
- __4_locations.json__
- __x_empty.json__ --> this is going to fail!


### Process logs

![alt text](https://github.com/MatteoDiPaolo/GoogleTakeoutLocations_to_GeoJson/raw/master/README_2.png)


# More cool logs

Command: `npm run start` over 5 input files.

Please note the journey of the **_2.json_** file:
- 1167.11297 Mb --> __1.16 GB__
- 3688763 --> __almost 4 milion locations processed__
- 551.443 Secs --> __almost 10 minutes processing__

![alt text](https://github.com/MatteoDiPaolo/GoogleTakeoutLocations_to_GeoJson/raw/master/README_3.png)

Command: `npm run start -- 1546300800000 1577836799000` over 5 input files.

![alt text](https://github.com/MatteoDiPaolo/GoogleTakeoutLocations_to_GeoJson/raw/master/README_4.png)