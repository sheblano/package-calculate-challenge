## Package Challenge

### Introduction
You want to send your friend a package with different things.
Each thing you put inside the package has such parameters as index number, weight and cost. The
package has a weight limit. Your goal is to determine which things to put into the package so that the
total weight is less than or equal to the package limit and the total cost is as large as possible.
You would prefer to send a package which weighs less in case there is more than one package with the
same price.

##Solution
each function are commented with the expected input and output and what should it does.

i tried to make the code readable/clean as much as possible for better debuging and tracing.

i did a simple design model for package and package items along with the custom ApiError.

the package only exporting the pack method to be used from outside and all other methods all internal helpers.

actually the solution is built within 2 days only due to personal/family circumstances which did not let me to have much imporivements to the code "not execuse"

##Testing
writting by Chai/Mocha and you can run **npm test** command for testing

##packaging
the package not published to npm and you can use **npm link** to install it locally for any project

