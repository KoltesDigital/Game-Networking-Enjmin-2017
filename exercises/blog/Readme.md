# Blog API

Available at https://api.blog.enjmin.koltes.digital

Only supports JSON request bodies (set header `Content-Type: application/json`) and only responds JSON as well.

## Authentication Token

Some routes require an authentication token. They respond with `401` if the token has expired or if the token is absent, and `400` for any other reason related to the token.

A single authentication tokens is generated via `POST /token`. It expires after 15 minutes.

Set header `X-Auth-Token: <token>` for requests which require an authentication token.

## Routes

### GET /messages

Retrieves the messages.

Responds with `200` and the body:

	{
		"mesages": [
			{
				"body": string,
				"date": integer (creation timestamp),
				"id": integer,
				"user": absent (user has been deleted) || {
					"id": integer,
					"name": string
				}
			},
			...
		]
	}

### POST /messages [token]

Creates a mesage.

Request body:

	{
		"body": string
	}

Responds with `201` and the body:

	{
		"id": integer
	}

### GET /messages/:id

Get message information.

Responds with `200` and the body:

	{
		"body": string,
		"date": integer (creation timestamp),
		"id": integer,
		"user": absent (user has been deleted) || {
			"id": integer,
			"name": string
		}	
	}

### PUT /users/:id [token]

Update user information.

Request body:

	{
		"body": string
	}

Responds with `204`.

Responds with `403` if the token user id doesn't match the route user id.

### DELETE /users/:id [token]

Delete user

Request body:

	{
		"name": string
	}

Responds with `204`.

Responds with `403` if the token user id doesn't match the route user id.

### POST /token

Generates a token for authentication.

Request body:

	{
		"userId": integer
	}

Responds with `201` and the body:

	{
		"token": string
	}

Responds with `401` if the user doesn't exist.

### POST /users

Create an user.

Request body:

	{
		"name": string
	}

Responds with `201` and the user id.

### GET /users/:id

Get user information.

Responds with `200` and the body:

	{
		"name": string
	}

### PUT /users/:id [token]

Update user information.

Request body:

	{
		"name": string
	}

Responds with `204`.

Responds with `403` if the token user id doesn't match the route user id.

### DELETE /users/:id [token]

Delete user

Request body:

	{
		"name": string
	}

Responds with `204`.

Responds with `403` if the token user id doesn't match the route user id.
