# tugh

###URL shortening service

##Overview

tugh is a simple URL shortening service written in Node.js, using Amazon DynamoDB, and deployed to AWS via Elastic Beanstalk. tugh exchanges long URLs for short codes (fewer than 10 characters) which can then be used to retrieve the long URL again. tugh codes are guaranteed to be unique, or to return a server error if tugh can't make a uniqueness guarantee due to extreme scale. See Architecture Considerations for more information.  

##API

###Shorten URL
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
###Retrieve URL for tugh code
+ retrieve URL for tugh code

    GET /url/:code

  - Response
    - Code: 200 (success)
    - Body:
```
        {"url": "<<URL>>"}
```
###Redirect to URL for tugh code
+ redirect to URL for tugh code

    GET /:code

  - Response
    - Code: 303 (success)
    - Headers.location: <<URL>>
    - Body:

##Architectural Considerations
tugh has been architected to be performant, resource efficient, and scalable.
+ The tugh server is written in Node.js due to its wide adoption, security, and proven mission-critical reliability.
  - The tugh server is stateless is can be horizontally scaled at will with one caveat (see below).
+ Tugh presently leverages Amazon DynamoDB for persistence - DynamoDB is capable of scaling to tens of thousands of transactions per second and arbitrarily large datasets with no additional development or management overhead incurred to the tugh service
+ Elastic Beanstalk is currently used for deployment and management due to its ease of use and managed services which greatly ease the move to production

###Caveats
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

###Local Mode
In local mode, tugh runs stand-alone and disconnected from enterprise infrastructure to support testing:
+ Runs on port 4501
+ Uses local DynamoDB emulator (Dynalite)

Follow these steps to install and run in local mode:

$npm install  
$npm test (ensure all tests passing)  
$npm run-script startLocal (tugh API listens on port 4501)  

###Deploying to AWS using Elastic Beanstalk
####Prerequisites
+ AWS account
+ AWS IAM Instance Profile with a role named 'tugh-role'
  - Per the iam_policy.json in the root of the project
+ Elastic Beanstalk Command Line Interface ($eb)

####Application initialization
```
 $eb init -r us-west-2 -p "Node.js"
 $eb create --instance_profile tugh-role
 ```
####Application deployment
```
 $zip tugh-deploy.zip -r * .[^.]*
 $eb deploy
 ```

##Examples
POSO examples can be found in the /examples directory

### Example 1 - loan application processing with triggers
Loan application processing driven by two triggers (loan application and loan decision). Scripts are provided to illustrate POSO api usage. The example can be run vua these steps:

$./exampleSetup.bash (NOTE: truncs the entire POSO database)  
$./fireLoanApplicationTrigger.bash  
$./fireLoanDecisionTrigger.bash  

### Example 2 - loan application processing with instance management
Loan application processing driven by instance management (starting an instance of a design, storing its instnace id, and then using that id to interact with the instance). Scripts are provided to illustrate POSO api usage. The example can be run vua these steps:

$./exampleSetup.bash (NOTE: truncs the entire POSO database)  
$./startLoanApplication.bash  
$./sendLoanDecision.bash  

### Example 3 - loan application processing extended to include a credit check
Loan application processing driven by instance management (starting an instance of a design, storing its instnace id, and then using that id to interact with the instance). Scripts are provided to illustrate POSO api usage. The example can be run vua these steps:

$./exampleSetup.bash (NOTE: truncs the entire POSO database)
$(different shell) node app.js  
$./startLoanApplication.bash  
$./sendLoanDecision.bash  

##POSO Technical Design

####POSO has a simple design that makes it conducive for hi-volume and high-availability in a multi-tenant environment.

+ JSON/REST API
+ Node + Mongo
+ Javascript orchestration design DSL
  - Arbitrary # of orchestration steps
  - Define API endpoints to be invoked by reference in steps
    - Assign local identifier
    - Define URL
    - Define security profile
      - Protocol (HTTP/S)
        - Provide server cert
      - Pass on OAuth token (optional)
      - Api-key (optional)
      - Client-Cert (optional)
    - Define error code range
  - Define initial data context
  - Extensible conditional logic
    - Simple expression language
    - Run designer's Javascript functions
+ Only invoke JSON/REST APIs asynch
  - Fire & Forget
  - Wait for callback before proceeding
+ Step can contain arbitrary # of parallel API invocations
+ Any error code from an API invocation puts the orchestration instance into an error state
  - Support replay same step
  - Support skip error step and go to next step
+ Complete context of responses from API endpoints maintained
  - Define data mask to be applied to outbound API invocations to filter data sent
+ Native support for invoking sub-orchestrations (via system API reference)
  -Able to create orchestration hierarchies of arbitrary depth

##License
TBD
