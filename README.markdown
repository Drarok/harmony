# Harmony [![Build Status](https://travis-ci.org/Drarok/harmony.svg?branch=master)](https://travis-ci.org/Drarok/harmony)

A data brokering HTTP server, written in Node.js.

## Currently Supported Back-Ends

* SQLite3
* MySQL
* PostgreSQL
* MSSQL
* CSV/TSV

## Terminology.

* Server: a backend storage system such as MySQL, SQLite, Postgres, MSSQL, or even CSV/TSV files.
* Table: a table on a given Server.
* Object: a grouped-together set of Tables, producing results.
* Collection: a group of Objects.

## Configuration

Create `config/collections.json` (there's a sample in there you can follow).

You must define at least one each of collection, server, and object.

    {
        "collection_1": {
            "servers": {
                "server_1": {
                    "type": "MySQL",
                    ...
                },
                "server_2": {
                    "type": "SQLite",
                    ....
                }
            },
            "objects": {
                "object_1": ["server_1", "server_2"],
                "object_2": ["server_2"]
            }
        },
        "collection_2": {
            ...
        }
    }


Start Harmony: `node harmony.js` (or you could use [forever][forever]).

## Usage

List all available collections in a Harmony instance.

    GET /_all_collections

List all objects within a supposed "support" collection.

    GET /support/_all_objects

Get all rows from the customers Object in the support collection. This will talk to one or more Servers, and return the results, combined into a single result set.

    GET /support/customers

Same as above, but applies a WHERE clause to each server: `WHERE name = 'Initrode'`.

    GET /support/customers?name=Initrode

Apply a WHERE *column* LIKE *value* clause to each server: `WHERE name LIKE 'Init%'`.

    GET /support/customers?name=~Init%

To match a literal tilde, escape it with a backslash: `WHERE name = '~Init%'`.

    GET /support/customers?name=\~Init%

Query keys prefixed with an underscore are reserved. Currently, sorting and limiting are supported.

**Note:** Each server can only order its own results. Sorting the whole dataset is left as an exercise for you.

**Note:** The limit option applies per server, so _limit=100 may return up to `100 * servers` results.

    GET /support/customers?_sort=id&_limit=10
    GET /support/customers?_sort=id[asc]&_limit=20
    GET /support/customers?_sort=id[desc]&_limit=50

## Sample Response

    [
        {
            "server": "sqlite",
            "rows": [
                {
                    "id": 1,
                    "name": "SQLite Customer 1"
                },
                {
                    "id": 2,
                    "name": "SQLite Customer 2"
                }
            ]
        },
        {
            "server": "mysql",
            "rows": [
                {
                    "id": 1,
                    "name": "MySQL Customer 1"
                }
            ]
        },
        {
            "server": "postgres",
            "rows": [
                {
                    "id": 1,
                    "name": "PostgreSQL Customer 1"
                }
            ]
        }
    ]

## Contributors

The contributors to Harmony are contained in the "CONTRIBUTORS.txt" file.

## License

The license for Harmony is contained in the "LICENSE.txt" file.

[forever]: https://github.com/nodejitsu/forever
