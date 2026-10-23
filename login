Command:
curl.exe -c cookies.txt -sS -w "\nHTTP %{http_code}\n" -X POST "http://localhost:5000/login" -H "Content-Type: application/json" -d '{"username":"grading_1792755078215","password":"TestPass123!"}'

Output:
{"message":"Login successful!"}
HTTP 200
