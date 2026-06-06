## Contents
If you want to run this project locally, you need to provide some data yourself.

Folder Structure:
```
local_data/
├── openrouteservice/
│   ├── config/
│   │   └── ors-config.yml
│   ├── elevation_cache/
│   ├── files/
│   │   └── gtfs_mvb_std_kn.zip
│   │   └── sachsen-anhalt-latest.osm-pbf
│   ├── graphs/
│   ├── logs/
├── overpass/
│   ├── db/
│   │   └── sachsen-anhalt-latest.osm.bz2
```

## OpenRouteService
 - gtfs_mvb_std_kn.zip
   - https://github.com/SmartCityMagdeburg2026/Datasources/tree/477945707257cd1023fc16f4c50dbe0b6b4fd75d/data/OEV-Daten_NASA_GmbH/GTFS
  - sachsen-anhalt-latest.osm.pbf
    - https://download.geofabrik.de/europe/germany.html

## Overpass
In case there is no sachsen-anhalt-latest.osm.bz2 publicly available, you have to convert it yourself:

`osmium cat sachsen-anhalt-latest.osm.pbf -o local_data/db/sachsen-anhalt-latest.osm.bz2`