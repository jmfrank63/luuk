#!/usr/bin/env bash

set -e

urlencode() {
  local string="$1"
  local encoded=""

  for ((i = 0; i < ${#string}; i++)); do
    char="${string:$i:1}"
    case "$char" in
    [a-zA-Z0-9.~_-]) encoded+="$char" ;;
    ' ') encoded+='+' ;;
    *)
      printf -v hex '%02X' "'$char"
      encoded+="%$hex"
      ;;
    esac
  done

  echo "$encoded"
}

# Check the operating system
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  date_cmd="date -j -f"
else
  # Linux and others
  date_cmd="date -d"
fi

username="jmfrank63"
location=${1:-"Moscow"}
utc_hour=${2:-"11"}
utc_hour=$(printf "%02d" $((10#$utc_hour)))
encoded_location=$(urlencode "$location")

# Use the GeoNames Search API to search for the location
location_response=$(curl -s --header 'Accept: application/json' "http://api.geonames.org/searchJSON?q=$encoded_location&maxRows=3&username=$username")
geonameId=$(echo "$location_response" | jq '.geonames[] | select(.fcode | startswith("PPL"))' | jq -s 'sort_by(-.population)| .[0].["geonameId"]')

# Use the GeoNames API to get the location details
location_response=$(curl -s --header 'Accept: application/json' "http://api.geonames.org/getJSON?geonameId=$geonameId&username=$username")

# Parse the JSON data and extract the required fields
offset=$(echo "$location_response" | jq '.["timezone"]["dstOffset"]')
latitude=$(echo "$location_response" | jq --raw-output '.["lat"]')
longitude=$(echo "$location_response" | jq --raw-output ' .["lng"]')
altitude=$(echo "$location_response" | jq '.["srtm3"]')

# Round the latitude and longitude to 4 decimal places to prevent being blocked
latitude=$(printf "%.4f" "$latitude")
longitude=$(printf "%.4f" "$longitude")

# Call the weather API with the location details for the exact hour
response=$(curl -s --header 'Accept: application/json' "https://api.met.no/weatherapi/locationforecast/2.0/compact?altitude=$altitude&lat=$latitude&lon=$longitude")
hour_details=$(echo "$response" | jq --arg hour "$utc_hour" '.properties.timeseries[] | select((.time | strptime("%Y-%m-%dT%H:%M:%SZ") | strftime("%H")) == $hour) | {time: .time, details: .data.instant.details}')
hour_details=$(echo "$hour_details" | jq -s)

# Round to the nearest multiple of 6
nearest_hour=$(( (((10#$utc_hour + 3) / 6) * 6) % 24 ))
nearest_hour=$(printf "%02d" $((10#$nearest_hour)))

nearest_details=$(echo "$response" | jq --arg hour "$nearest_hour" '.properties.timeseries[] | select((.time | strptime("%Y-%m-%dT%H:%M:%SZ") | strftime("%H")) == $hour) | {time: .time, details: .data.instant.details}')

echo "---------------------------------"
echo Location: "$location"
echo UTC offset: "$offset hours"
echo Latitude: "$latitude"
echo Longitude: "$longitude"
echo Altitude: "$altitude m"
nearest_details=$(echo "$nearest_details" | jq -s)
num_entries=$(echo "$hour_details" | jq '. | length')
echo
echo "---------------------------------"
# Use jq to parse the JSON array and iterate over it
echo "$hour_details" | jq -c '.[]' | while read -r item; do
  # Use jq to extract the temperature and windSpeed from each item
  utc_time_string=$(echo "$item" | jq -r '.time')
  utc_time_string=${utc_time_string%Z} # Remove the 'Z' at the end
  # Calculate the UTC time
  utc_time=$($date_cmd -u -j -f "%Y-%m-%dT%H:%M:%S" "$utc_time_string" +"%Y-%m-%dT%H:%M:%S")

  # Calculate the local time by adding the offset to the UTC time
  local_time=$($date_cmd -u -j -v "+${offset}H" -f "%Y-%m-%dT%H:%M:%S" "$utc_time" +"%Y-%m-%dT%H:%M:%S")
  # Print the local date
  echo
  echo "Local Date: $($date_cmd -j -f "%Y-%m-%dT%H:%M:%S" "$local_time" +"%Y-%m-%d")"
  echo "Local Time: $($date_cmd "%Y-%m-%dT%H:%M:%S" "$local_time" +"%H:%M:%S")"
  echo "Temperature: $(echo "$item" | jq '.details.air_temperature')"
  echo "Wind Speed: $(echo "$item" | jq '.details.wind_speed')"
  echo "Wind Direction: $(echo "$item" | jq '.details.wind_from_direction')"
done
count=0
# Use jq to parse the JSON array and iterate over it
echo "$nearest_details" | jq -c '.[]' | while read -r item; do
  count=$((count + 1))
  if [ $count -lt $((num_entries)) ]; then
    continue
  fi
  # Use jq to extract the temperature and windSpeed from each item
  utc_time_string=$(echo "$item" | jq -r '.time')
  utc_time_string=${utc_time_string%Z} # Remove the 'Z' at the end
  # Calculate the UTC time
  utc_time=$($date_cmd -u -j -f "%Y-%m-%dT%H:%M:%S" "$utc_time_string" +"%Y-%m-%dT%H:%M:%S")

  # Calculate the local time by adding the offset to the UTC time
  local_time=$($date_cmd -u -j -v "+${offset}H" -f "%Y-%m-%dT%H:%M:%S" "$utc_time" +"%Y-%m-%dT%H:%M:%S")
  # Print the local date
  echo
  echo "Local Date: $($date_cmd -j -f "%Y-%m-%dT%H:%M:%S" "$local_time" +"%Y-%m-%d")"
  echo "Local Time: $($date_cmd "%Y-%m-%dT%H:%M:%S" "$local_time" +"%H:%M:%S")"
  echo "Temperature: $(echo "$item" | jq '.details.air_temperature')"
  echo "Wind Speed: $(echo "$item" | jq '.details.wind_speed')"
  echo "Wind Direction: $(echo "$item" | jq '.details.wind_from_direction')"
done
