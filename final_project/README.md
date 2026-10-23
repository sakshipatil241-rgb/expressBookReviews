Practice-Project

The router exports asynchronous Axios helpers for retrieving books by ISBN, author, and title, or retrieving all books. They call the running service at `http://localhost:5000` by default; set `BOOKS_API_URL` to use a different service URL. Axios errors are rethrown with the HTTP status or network failure context.