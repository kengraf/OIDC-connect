from http.server import BaseHTTPRequestHandler, HTTPServer
import os
import json
from google.oauth2 import id_token
from google.auth.transport import requests

CLIENT_ID = "958115105182-0rvbal5tufba8jsubammhgq3ee149vdu.apps.googleusercontent.com"

class FileServerHandler(BaseHTTPRequestHandler):

    def do_GET(self):
        # Remove leading slash and decode the requested path
        file_path = self.path.lstrip("/").split("?")[0]

        # Default to "index.html" if the path is empty
        if file_path == "":
            file_path = "index.html"

        # Check if the requested file is an HTML file
        if os.path.isfile(file_path) and file_path.endswith(".html"):
            try:
                # Open and read the HTML file
                with open(file_path, "r", encoding="utf-8") as file:
                    content = file.read()

                # Send HTTP response headers
                self.send_response(200)
                self.send_header("Content-type", "text/html")
                self.end_headers()

                # Write the HTML content to the response
                self.wfile.write(content.encode("utf-8"))
            except Exception as e:
                # Handle file reading errors
                self.send_error(500, f"Internal Server Error: {e}")
        else:
            # Respond with a 404 if the file is not found or is not HTML
            self.send_error(404, "File Not Found")
            
    def do_POST(self):
        cookie_header = self.headers.get("Cookie")
        if cookie_header:
            cookies = dict(item.split("=") for item in cookie_header.split("; "))
            user_cookie = cookies.get("userid", "No userid cookie found")
        else:
            user_cookie = "No cookie found"

        # Get content length and read the request body
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length).decode('utf-8')

        # Try to parse the body as JSON
        try:
            data = json.loads(body)
        except json.JSONDecodeError:
            self.send_response(400)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error": "Invalid JSON"}).encode('utf-8'))
            return

        # Check for a JWT in the request body
        token = data.get("idToken")
        if not token:
            self.send_response(400)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error": "JWT is required"}).encode('utf-8'))
            return

        try:
            # Specify the CLIENT_ID of the app that accesses the backend:
            idinfo = id_token.verify_oauth2_token(token, requests.Request(), CLIENT_ID)
            sub = idinfo['sub']
            email = idinfo['email']
            
            # Send the response
            self.send_response(200)
            self.send_header("Content-type", "application/json")
            # Add the cookie to the header
            self.send_header("Set-Cookie", "sub="+sub+"; HttpOnly; Secure=false; SameSite=Lax; Path=/" )
            self.end_headers()
            self.wfile.write(json.dumps(idinfo).encode('utf-8'))

        except ValueError:
            # Invalid token
            self.send_response(401)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error": "Invalid JWT"}).encode('utf-8'))

# Start the server
def run(server_class=HTTPServer, handler_class=FileServerHandler, port=80):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print(f"Handling JWTs on port {port}")
    httpd.serve_forever()

if __name__ == '__main__':
    run()
