# tugh

### URL shortening service - running in dev [here](http://tugh-dev.us-west-2.elasticbeanstalk.com/)

## Overview

tugh is a simple URL shortening service written in Node.js, using Amazon DynamoDB, and deployed to AWS via Elastic Beanstalk. tugh exchanges long URLs for short codes (fewer than 10 characters) which can then be used to retrieve the long URL again. tugh codes are guaranteed to be unique, or to return a server error if tugh can't make a uniqueness guarantee due to extreme scale. See Architecture Considerations for more information.  

## API

### Shorten URL
+ Exchange URL for unique code of 10 characters or less

    POST /url

  - Request Body
```
        {"url": "<<url>>"}
```
  - Response
    - Code: 200 (success)
    - Body:
```
        {"code": "<<tugh code>>"}
```
### Retrieve URL for tugh code
+ retrieve URL for tugh code

    GET /url/:code

  - Response
    - Code: 200 (success)
    - Body:
```
        {"url": "<<URL>>"}
```
### Redirect to URL for tugh code
+ redirect to URL for tugh code

    GET /:code

  - Response
    - Code: 303 (success)
    - Headers.location: << original url>>
    - Body:

## Architectural Considerations
tugh has been architected to be performant, resource efficient, and scalable.
+ The tugh server is written in Node.js due to its wide adoption, security, and proven mission-critical reliability.
  - The tugh server is stateless and can be horizontally scaled at will with one caveat (see below).
+ Tugh presently leverages Amazon DynamoDB for persistence - DynamoDB is capable of scaling to tens of thousands of transactions per second and arbitrarily large datasets with no additional development or management overhead incurred to the tugh service
+ Elastic Beanstalk is currently used for deployment and management due to its ease of use and managed services which greatly ease the move to production

### Caveats
+ tugh generates unique codes which it exchanges for long URLs. These codes must be unique to prevent users from seeing one another's data (URLs). Codes are generated as [cuid](https://www.npmjs.com/package/cuid) slugs which form uniqueness based, in part, on timestamp, hostname and PID of the generating server. There is a minuscule chance that duplicate codes may be generated, which increases with scale. As a failsafe the tugh database is configured to return a duplication error in this case so the user will see a server error instead of receive a duplicate code. It is left to the roadmap to introduce retries or other mechanisms to alleviate this potential, or switch to a different code generation library altogether.
   - Note that code/URL entries should be removed from the database at regular intervals to further reduce the risk of duplication

### Roadmap

+ Platformization
    - User access management
    - Multitenancy
    - Pluggable features
    - Analytics

##Running tugh
###System requirements
-------------
You need the following prerequisites to install and run tugh

* node = v6.9.1
* npm  = v3.10.8
* DynamoDB (API Version 2012-08-10) (or use Local Mode)
* Amazon Web Services Elastic Beanstalk application (or manually deploy and start)

### Local Mode
In local mode, tugh runs stand-alone and disconnected from enterprise infrastructure to support testing:
+ Runs on port 8081
+ Uses local DynamoDB emulator (Dynalite)

Follow these steps to install and run in local mode:

$npm install  
$npm test (ensure all tests passing)  
$npm run-script startLocal (tugh API listens on port 8081)  

### Deploying to AWS using Elastic Beanstalk
#### Prerequisites
+ AWS account
+ AWS IAM Instance Profile with a role named 'tugh-role'
  - Per the iam_policy.json in the root of the project
+ Elastic Beanstalk Command Line Interface ($eb)

#### Application initialization
```
 $eb init -r us-west-2 -p "Node.js"
 $eb create --instance_profile tugh-role
 ```
#### Application deployment
```
 $zip tugh-deploy.zip -r * .[^.]*
 $eb deploy
 ```
## License
Unlicense - use/abuse
