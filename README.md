# The Stoke List

## Getting Started:

This section covers how to get Appmaker running locally. The workflow is optimized for contributors.

### Coding Style:

https://github.com/simonwex/javascript-style-guide

### Dependencies:

Make sure you have `nodejs`, `npm`, and `git` installed.

`gulp` is required to run the test suite and package client-side libraries with browserify. To install gulp on unix and OS X, run `sudo npm install gulp -g`.

### Environment Setup And Configuration

Install Node packages:

```
npm install
```

Configure your env:
```
cp sample.env .env

```

A short explanation of a complete `.env` file:

```
DATABASE_URL: The url, including credentials to access the db. This can be either mysql, postges or sqlite3
