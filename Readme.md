# Luuk Weather Service Demo

## Quickstart

### Prerequesits

You must have nodejs installed, and you need a username activated for [geonames.org](https://www.geonames.org) depicted here as `<username>`

```bash

Install node version manager with latest lts

```bash
# installs NVM (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# download and install Node.js
nvm install 20

# verifies the right Node.js version is in the environment
node -v # should print `v20.12.2`

# verifies the right NPM version is in the environment
npm -v # should print `10.5.0`
```

It is also recommended to have docker and jq installed.

Linux:

```bash
sudo apt install jq
```

MacOS:

```bash
sudo brew install jq
```

Clone the repo from [Github](https://github.com/jmfrank63/luuk) or
[Gitflic](https://gitflic.ru/project/frankjohannes/luuk.git)

```bash
git clone https://github.com/jmfrank63/luuk
```

or

```bash
git clone https://gitflic.ru/project/frankjohannes/luuk.git
```

### Running the project

```bash
docker pull ghcr.io/jmfrank63/luuk/luuk:latest
docker run --name luuk -e GEO_USERNAME=<username> -p 3000:3000 ghcr.io/jmfrank63/luuk/luuk:latest

```

```bash
cd luuk
node --test
export GEO_USERNAME=<username>
node src/server.js
curl "http://127.0.0.1:3000/api/weather?location=Tomsk&utc_hour=7" |jq 
```

This should display the temperature and wind data for the next 10 days for the city of Tomsk at around 14:00 (2:00 PM).

You can also call without any parameters

```bash
curl "http://127.0.0.1:3000/api/weather" |jq
```

This will output the default location Moscow at 14:00 (2:00 PM).

Using a browser navigate to:

[http://localhost:3000](http://localhost:3000)

The default location will be displayed upon start (Moscow 14:00). To change the local time
modify the UTC time. Its value plus the displayed DST offset will yield the local time.

Try a few locations:

Tomsk,
Newcastle upon Tyne,
Berlin,
San Francisco California,
Rio de Janeiro,
Wellington

You can also search in cyrillic:

Пермь
Ворота,
Ленинград Россия, (St Petersburg, Russia)

Since historic names work try some more:

Karl-Marx-Stadt, (Chemnitz, Germany)
Konstantinopel, Byzanz, (Istanbul, Türkiye)
Saigon, (Ho Chi Minh City, Vietnam)

Suburbs also work:

Тропарёво-Никулино (Troparyovo-Nikulino, Russia)

even metro stations:

Тропарёво, (Troparëvo, Russia)

Since by selecting the right wording almost any location can be selected,
there is no entering locations based on latitude and longitude.
You can always go to a map and select a location to get specific coordinates.

### Code description

The service uses no dependencies. Everything is written in pure nodejs javascript.
While this leads to a little more code, the actual increase is not huge. The benefit is obviously there will be no dependency chain attack and there are no hidden functionalities.

While writing your own web server with pure node does not compare to a framework like express, express does essentially the same as this hand crafted webserver:

Creating a webserver, handling routes, handlers, middleware, logging, except with a small difference of a few hours against thousands of hours.

The biggest benefit is the small size of the docker image. Less then 64MB on amd64 and less than 90MB on arm64 (I have no idea why arm64 is about 50% larger than amd64).

The frontend follows the same principial as the backend. Minimize your dependencies. For layouting css-grid is used, for dynamic content htmx. This is fast enough compared to a frontend framework, but reduces the dual state to a single state. A single javascript file is all that is needed to have a pleasant frontend experience. Instead of updating the whole page, a single html elememt is updated.

All features have been implemented except for the "location", which I interpreted as coordinates. Since location can work down to metro stations, almost any location that has a name can be entered. The logic behind this is also that if there is no name, the weather data is likely not applicable or available either.

The rate limiter is fixed, but can be modified by setting the environment variables RATE_LIMIT and MAX_TOKENS.
The same is true for HOSTNAME and PORT, though this can be also achieved via the docker container.

The container is a multibuild, and should work on both amd64 and arm64.

Both the api and the website have two parameters, `location` and `utc_hour`.

Call the api like this:

```bash
curl "http://localhost:3000/api/weather?location=Tomsk&utc_hour=0"
```

Both parameters are optional, defaulting to Moscow and 11 respectively,.

The output is a local time (utc_hour + DST). For the first two to three days, as long as there are hourly data available, is the exact hour. For later days the nearest 6 hour point is choosen. For a three days ahead temperature and wind prediction this is acurate enough, as the deviation is a maximum of 3 hours.

The website is repsonsive and should change to column layout on smaller devices. This roughly works, but has not been tested to details.

There is simple logging available to the console for api calls made and response status codes. If you are running native, the logs are printed to the terminal.
If run from a docker container, get the logs by `docker <containername></containername> logs`.

Adding now more endpoints or features should be relatively straight forward. Since there is no end in additonal features that could be implemented the project has been stopped here.

Possible features are:

Display wind direction as NNO, NO, SW, ...
Add percipitation
Add a counter for number of requests made by the website
Add widgets from yr.no
Implement caching
Add a database to store results in
Write the server in Rust, C or Haskell
