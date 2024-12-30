from http.server import BaseHTTPRequestHandler, HTTPServer
import os
import json
from google.oauth2 import id_token
from google.auth.transport import requests

CLIENT_ID = "958115105182-0rvbal5tufba8jsubammhgq3ee149vdu.apps.googleusercontent.com"

class FileServerHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        # Get the requested file path
        filepath = self.path.lstrip('/')  # Remove leading slash
        
        # If no file is specified, serve an index file or show directory listing
        if not filepath:
            filepath = 'index.html'  # Default file (you can change this)

        # Check if the file exists in the current directory
        if os.path.exists(filepath) and os.path.isfile(filepath):
            # Serve the file
            self.send_response(200)
            # Determine the content type
            if filepath.endswith('.html'):
                self.send_header("Content-Type", "text/html")
            elif filepath.endswith('.css'):
                self.send_header("Content-Type", "text/css")
            elif filepath.endswith('.js'):
                self.send_header("Content-Type", "application/javascript")
            elif filepath.endswith('.json'):
                self.send_header("Content-Type", "application/json")
            else:
                self.send_header("Content-Type", "application/octet-stream")
            self.end_headers()
            
            # Read and send the file content
            with open(filepath, 'rb') as f:
                self.wfile.write(f.read())
        else:
            # File not found
            self.send_response(404)
            self.send_header("Content-Type", "text/plain")
            self.end_headers()
            self.wfile.write(b"404 Not Found")

    def do_POST(self):
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
            userid = idinfo['sub']
            email = idinfo['email']
            
            # TODO/FIX should store the token, userid, and email in a store
            # to check future requests
            
            cookie = http.cookies.SimpleCookie()
            cookie["my_cookie"] = "Hello World"
            cookie["my_cookie"]["path"] = "/"  # Set the path for the cookie
    
            # Send the response
            self.send_response(200)
            self.send_header("Content-type", "text/html")
            # Add the cookie to the header
            self.send_header("Set-Cookie", cookie.output(header=''))
            self.end_headers()
            self.wfile.write(b"Cookie set!")
            
        except ValueError:
            # Invalid token
            self.send_response(401)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error": "Invalid JWT"}).encode('utf-8'))
        try:

# Start the server
def run(server_class=HTTPServer, handler_class=FileServerHandler, port=80):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print(f"Serving files in the current directory and handling JWTs on port {port}")
    httpd.serve_forever()

if __name__ == '__main__':
    run()
