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
