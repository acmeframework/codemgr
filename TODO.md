# TODO - prior to v1.0.0 release

## Features

- implement inheritance of templates
  - priority merging
- add yarn support
- look into using a package.json in the template instead of putting scripts and package requirements in the template config file
- add templating (handlebars??) to files in the template folders
  - variables can be defined in the template config file and/or environment/command line (e.g. --extra-vars)
- Ensure package upgrade via NPM/yarn work as expected as well as configuration changes (for now config changes are overwrite/backup)

## Code improvements

- clean up code base
- add unit testing - achieve 100% coverage
- add integration testing
  - Node version testing (current three under maintenance - 10, 12, 14)
  - NPM version testing (current supported versions)
  - yarn version testing (same as above)
- automate build / NPM publish w/GitHub Actions
- safegaurd data input from users to mitigate security issues (e.g. escape input to ensure elevated privileges not possible - shouldn't be an issue as we run as the user already - just be safer)
