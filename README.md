# Auth0 Demo
Auth0 Demo Application


# High level functionality

This demo will showcase many of the highly used implementation features for Auth0 using base Javascript

Features

* [Quick Start](https://auth0.com/docs/quickstart/spa/react) 
* [User Account Linking](https://auth0.com/docs/users/user-account-linking)
* [Verify Emails] (https://auth0.com/docs/users/verify-emails)
* [User Profile Metadata] (https://auth0.com/docs/users/metadata)
* [Social Identity Providers] (https://auth0.com/docs/connections/identity-providers-social)


# How to install locally

1. Create an [Auth0 account] (https://auth0.com/signup)
2. Clone this repo down to your local environment
3. Install [Node.js and NPM] (https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
4. Create a new application in the Auth0 dashboard and add https://localhost:3000 to Allowed Callback URLs, Allowed Logout URLs and Allowed Web Origins.
   - Local port 3000 is the default port where NPM hosts your server
5. Update the auth_config.json file with your application's client_id and domain values
6. Navigate to the SPA folder
  
```
> cd c:\temp\auth0\auth0_demo
```
7. Run the below NPM commands to initialize your local server

```
> npm install
> npm start
```
8. Open your application's [index page] (https://localhost:3000)
