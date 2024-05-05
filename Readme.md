# Luuk Weather Service Demo

## Quickstart

### Prerequesits

You must have nodejs installed

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
cd luuk
node --test
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
