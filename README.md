
[![Build Status](https://travis-ci.org/cumbanch/TACS-COVID-G2.png?branch=master)](https://travis-ci.org/cumbanch/TACS-COVID-G2)

[![codecov.io Code Coverage](https://img.shields.io/codecov/c/github/cumbanch/TACS-COVID-G2.svg)](https://codecov.io/github/cumbanch/TACS-COVID-G2?branch=master) 

[![Known Vulnerabilities](https://snyk.io/test/github/cumbanch/TACS-COVID-G2/badge.svg?targetFile=backend/package.json)](https://snyk.io/test/github/cumbanch/TACS-COVID-G2?targetFile=backend/package.json)

# TACS-COVID-G2

The application allows following the progression of the COVID-19 pandemic using different tools. The following API will be used as the data source: https://github.com/Laeyoung/COVID-19-API

* [Prerequisites](#prerequisites)
* [Application](#application)
* [Backend](#backend)
    * [Starting the backend](#starting-be)
        * [Environment variables](#environment-be)
        * [Modes](#modes)
            * [Development](#development)
            * [Testing](#testing)
    * [Documentation](#documentation)
* [Frontend](#frontend)
    * [Starting the frontend](#starting-fe)
        * [Environment variables](#environment-fe)

<a id="prerequisites"></a>
## Prerequisites

You need to have installed:

* [npm](https://www.npmjs.com/get-npm)

* [docker](https://www.docker.com/products/docker-desktop)

<a id="application"></a>
## Application
In this section we will explain how to run the application as a whole. If you need to run a specific part of it, please visit the [backend](#backend) or [frontend](#frontend) sections. First of all we need to create the environment files in the root of the project:
* `.env.db`: This file contains the next variables of the backend application: `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_USER`, `POSTGRES_PASSWORD` and `POSTGRES_DB`.
* `.env.app`: This file contains the remaining variables of the backend application.
* `.env.web`: This file contains the variables of the frontend application.

*Note: for more information, visit the [backend](#environment-be) or [frontend](#environment-fe) environment variables sections.*

Once the environment files were created, we can start the application as a whole running `docker-compose up` in the root of the project. Now you just need to go to [http://localhost:8081](http://localhost:8081) for accessing the application.

<a id="backend"></a>
## Backend
Inside this section we assume the `backend` folder as the root of the project.

<a id="starting-be"></a>
### Starting the backend

The backend consists in two containers, one for the application and the other for the database. You can start the application in two different modes (development or testing) and in both of them you need to create an environment file (`.env.development` or `.env.testing`) in the root folder. These are the environment variables:

<a id="environment-be"></a>
#### Environment variables
You can also check the `.env.example` file for guidance:
##### `POSTGRES_HOST` (required)
The host of the database.
##### `POSTGRES_PORT` (required)
The port of the database.
##### `POSTGRES_USER` (required)
The user for accessing the database.
##### `POSTGRES_PASSWORD` (required)
The password for accessing the database.
##### `POSTGRES_DB` (required)
The name of the database.
##### `SECRET` (required)
The `secret` value used for JWT generation and verification.
##### `HASHING_SALTS` (required)
Amount of salts used for hashing the users' password.
##### `COVID_API_BASE` (required)
Base route of the COVID API which is used to get the numbers of confirmed, deaths and recovered cases.
##### `PASSWORD_ADMIN` (required)
The password for the first user admin created.
##### `COVID_API_TIMESERIES_ENDPOINT` (optional | default = `/jhu-edu/timeseries?onlyCountries=true&iso2=`)
Relative route of the COVID API's endpoint used for getting the day by day number of cases in a country.
##### `COVID_API_LATEST_ENDPOINT` (optional | default = `/jhu-edu/latest?onlyCountries=true&iso2=`)
Relative route of the COVID API's endpoint used for getting the last update of cases in a country.
##### `TELEGRAM_API_KEY` (required)
The API KEY generated in the @BotFather fot the Telegram Bot.
##### `TELEGRAM_LIST_PAGINATION` (optional | default = `15`)
Number of results per page for paginated telegram responses.
##### `POSTGRES_LOGGING` (optional | default = `false`)
If true, the application will log every database query.
##### `PORT` (optional | default = `8080`)
The port in which the application will be running.
##### `LOGGER_MIN_LEVEL` (optional | default = `debug`)
We use [pino](https://github.com/pinojs/pino) for logging. You can refer to their [documentation files](https://github.com/pinojs/pino/tree/master/docs) and see the available [levels](https://github.com/pinojs/pino/blob/master/docs/api.md#levels).
##### `DEFAULT_PAGINATION` (optional | default = `20`)
Number of results per page for paginated endpoints.
##### `MOMENT_TIMEZONE` (optional | default = `America/Buenos_Aires`)
Timezone in which the dates of the responses will be shown.
##### `EXPIRATION_UNIT_ACCESS_TOKEN` (optional | default = `minutes`)
Time units used for access token expiration time.
##### `EXPIRATION_UNIT_REFRESH_TOKEN` (optional | default = `hours`)
Time units used for refresh token expiration time.
##### `EXPIRATION_UNIT_ID_TOKEN` (optional | default = `minutes`)
Time units used for id token expiration time.
##### `EXPIRATION_VALUE_ACCESS_TOKEN` (optional | default = `15`)
Amount of time (based on set units) for access token expiration time.
##### `EXPIRATION_VALUE_REFRESH_TOKEN` (optional | default = `24`)
Amount of time (based on set units) for refresh token expiration time.
##### `EXPIRATION_VALUE_ID_TOKEN` (optional | default = `10`)
Amount of time (based on set units) for id token expiration time.
##### `AUTOMATICALLY_UP` (optional | default = `false`)
If true, the application will run pending database migrations before start listening.
##### `EXTERNAL_TOKEN_HEADER_NAME` (optional | default = `x-external-access-token`)
Name of the header to identificate the external access token.
##### `EXTERNAL_PROVIDER_NAME_HEADER_NAME` (optional | default = `x-external-provider-name`)
Name of the header to identificate the external provider name.
##### `EXTERNAL_PROVIDER_NAME_HEADER_NAME` (optional | default = `x-external-provider-name`)
Name of the header to identificate the external provider name.
##### `CHECK_FACEBOOK_TOKEN_URL` (optional | default = `https://graph.facebook.com/me`)
Url provided by Facebook to get the user information.

<a id="development"></a>
 #### Modes
 
<a id="development"></a>
 ##### Development mode
 
You have to run `npm run development` or `npm start`.
The containers will be run in background with the following names:

 - **Application**: covid-19-dev
 - **Database**: covid-19-db-dev

The application will be accesible from [http://localhost:8080/](http://localhost:8080/) and the port **9229** will be available to link a debugger.
In this mode you can connect your host machine to the database with the following information:

 - **Host**: `POSTGRES_HOST`
 - **Port**: 35432
 - **Username**: `POSTGRES_USER`
 - **Password**: `POSTGRES_PASSWORD`
 - **Database name**: `POSTGRES_DB`

<a id="testing"></a>
 ##### Testing mode 
 
You have to run `npm run testing`.
The container (in foreground) will be run the tests, print the coverage and finally will be stopped.

<a id="documentation"></a>
### Documentation

The documentation is written with [Swagger](https://swagger.io/) and can be accessed entering the relative route `/api-docs`.

<a id="frontend"></a>
## Frontend
Inside this section we assume the `react-frontend` folder as the root of the project.

<a id="starting-fe"></a>
### Starting the frontend

The frontend consists in one container for the React application. You need to create an environment file (`.env.development`) in the root folder and then run `npm start`. These are the environment variables:
 
<a id="environment-fe"></a>
#### Environment variables
You can also check the `.env.example` file for guidance:
##### `REACT_APP_API_BASE_URL` (required)
The host of the backend API.

## Admin access
By default, an unique admin user is created. Use the follow username and password to enter as a admin:

 - **Application**: admin@tacs.grupo2.com.ar
 - **Database**: tacs_admin
