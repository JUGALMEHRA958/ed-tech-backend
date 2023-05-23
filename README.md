# IndiaNIC Node Project

## Prerequisite (Development)

| Module | Version |
| --- | --- |
| Node | 16.14.0 |
| Npm | 6.13.0 |
| Mongodb | 4.4 |


## Running Project In Local
``` bash
$ git clone -b <branchName> <gitUrl> <projectName>

$ cd configs

$ mv configSample.js configs.js

$ vi configs.js (need to change environment)

$ cd .. 

$ mv .env.sample .env.local(file name should be based on environment dev/staging/production)

$ vi .env.local (need to change environment related details)

$ npm install

$ node server.js

```
------------

## Code Quality Check

> Download Java Version 11

> Download SonarQuebe from https://www.sonarqube.org/downloads/

> Please add below line at end of the file soanrqube-7.9.1 > conf > sonar.properties #sonar.host.url=http://localhost:9000

> Install sonarqube-scanner from https://www.npmjs.com/package/sonarqube-scanner

> Follow Steps given in this link https://yuriburger.net/2017/09/27/getting-started-with-sonarqube-and-typescript/ Except Rules

> Command to start sonarquebe serving on localhost:9000 $ sonarqube-7.9.1/bin/macosx-universal-64/sonar.sh start

> Start analysis of project with following command $ sonar-scanner

## Deployment In Staging Server

``` bash
$ git clone -b <branchName> <gitUrl> <projectName>

$ cd configs

$ mv configSample.js configs.js

$ vi configs.js (need to change environment)

$ cd .. 

$ mv .env.sample .env.dev(file name should be based on environment dev/staging/production)

$ vi .env.staging (need to change environment related details)

$ cd ..

$ sh package.sh

```
------------

## Start Server Using pm2

``` bash
$ pm2 start server.js --name="<instance_name>" (for creating)

$ pm2 restart <instance_id> or <instance_name>

$ pm2 delete <instance_id> or <instance_name>

$ pm2 logs <instance_id> or <instance_id> (to check logs or errors)

$ pm2 logs <instance_id> --lines=100 (to check particular lines of previous logs)

```
------------

## Deployment With CI/CD
> Coming Soon

## Node Coding Standards

> You can get more information on node coding stantdards from [here](https://docs.google.com/document/d/1_ejxCdzwZzWLrhy1xPmzSh8mt7pnz1p50vuHQSnVcXE/edit).


## Directory Structure
```
|-- CommonSeedV12/
    |-- app/
        |-- locales/
            |-- de.json
            |-- en.json
            |-- es.json
        |-- modules/
            |-- Admin/
                |-- Controller.js
                |-- Projection.json
                |-- Routes.js
                |-- Schema.js
                |-- swagger.json
                |-- Validator.js
            |-- AdminManagement/
            |-- Authentication/
            |-- ...
        |-- services/
            |-- Common.js
            |-- Cron.js
            |-- Email.js
            |-- File.js
            |-- Form.js
            |-- PushNotification.js
            |-- RequestBody.js
            |-- Seed.js
    |-- configs/
        |-- configs.js
        |-- express.js
        |-- Globals.js
        |-- mongoose.js
        |-- P8Apns.p8
        |-- commonlyUsedPassword.json
    |-- node_modules/
    |-- public/
        |-- style.css
        |-- password-reset.html
    |-- .env.dev
    |-- .env.production
    |-- .env.staging
    |-- README.md
    |-- .gitignore
    |-- server.js
    |-- package.json
    |-- package-lock.json
    |-- sonar-project.js
    |-- swagger.json
       
```
-------------

