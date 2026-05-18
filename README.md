# SLSPmails - Alma Cloud App

## Overview

This repository contains the [Alma Cloud App](https://developers.exlibrisgroup.com/cloudapps/) for the SLSPmails service provided by [SLSP](https://slsp.ch/).

The application displays the delivery status of emails sent via the SLSP mail server.

## Requirements

In order to use this app

- your institution must be a member of the SLSP network zone.
- your Alma user has to contain at least of one these user roles:
    - Fulfillment Services Manager
    - User Manager
    - General System Administrator

Please contact [SLSP Support](https://slsp.atlassian.net/servicedesk/customer/portal/1) if you have any questions.

## Use

See the start page of the app for further information: </br>
<img src=./preview/manual.png alt="drawing" width="300"/>

## Issues and defects
For questions or to report an issue, please contact [SLSP Support](https://slsp.atlassian.net/servicedesk/customer/portal/1).

## Licence 

[GNU Genereal Public Licence v3.0](https://github.com/Swiss-Library-Service-Platform/slspmails-cloud-app/blob/main/LICENCE)

## Development Notes

### Common Issues 
#### MacOS Error: OpenSSL Error 'ERR_OSSL_EVP_UNSUPPORTED'

Run in Terminal: `export NODE_OPTIONS=--openssl-legacy-provider`

and then run `eca start` again.