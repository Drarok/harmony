# Harmony

## Terminology.

* Server: a backend storage system such as MySQL, SQLite, Postgres, MSSQL.
* Table: a table on a given Server.
* Object: a grouped-together and column-mapped set of Tables, producing results.
* Collection: a group of logically-related Objects.

## Examples

    GET /support/customers

Get all rows from the customers Object in the support collection. This will talk to one or more Servers, and return the results, combined into a single result set.

    GET /support/customers?name=Initrode*

Same as above, but applies a WHERE clause under the hood: `WHERE name LIKE 'Initrode%'`.
