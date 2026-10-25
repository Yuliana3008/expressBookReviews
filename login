curl -X POST http://localhost:5000/customer/login -H "Content-Type: application/json" -d '{"username": "john", "password": "password123"}' -c cookies.txt
User successfully logged in