Command:
curl.exe -c cookies.txt -i -X POST "http://localhost:5000/customer/login" -H "Content-Type: application/json" -d '{"username":"demo_user_002","password":"TestPass123!"}'

Output:
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8

{"message":"Login successful.","username":"demo_user_002"}
