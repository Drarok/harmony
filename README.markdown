# Harmony

A data brokering HTTP server, written in Node.js.

## Terminology.

* Server: a backend storage system such as MySQL, SQLite, Postgres, MSSQL, CouchDB, MongoDB, etc.
* Table: a table on a given Server.
* Object: a grouped-together and column-mapped set of Tables, producing results.
* Collection: a group of logically-related Objects.

## Examples

Get all rows from the customers Object in the support collection. This will talk to one or more Servers, and return the results, combined into a single result set.

    GET /support/customers

Same as above, but applies a WHERE clause to each server: `WHERE name = 'Initrode'`.

    GET /support/customers?name=Initrode

Apply a WHERE *column* LIKE *value* clause to each server: `WHERE name LIKE 'Init%'`.

    GET /support/customers?name=~Init%

To match a literal tilde, escape it with a backslash: `WHERE name = '~Init'`.

    GET /support/customers?name=\~Init%

Query keys prefixed with an underscore are reserved. Currently, sorting and limiting are supported.

**Note:** Each server can only order its own results. Sorting the whole dataset is left as an exercise for you.
**Note:** The limit option applies per server, so _limit=100 may return up to `100 * servers` results.

    GET /support/customers?_sort=id&_limit=10
    GET /support/customers?_sort=id[asc]&_limit=20
    GET /support/customers?_sort=id[desc]&_limit=50
