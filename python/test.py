from http.server import BaseHTTPRequestHandler, HTTPServer
import os
import json
import jwt  # Install with: pip install pyjwt

# Secret key for decoding JWT (for demonstration purposes)
SECRET_KEY = "your_secret_key"

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
        token = data.get("jwt")
        if not token:
            self.send_response(400)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error": "JWT is required"}).encode('utf-8'))
            return

        # Verify and decode the JWT
        try:
            decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({
                "message": "JWT successfully verified",
                "decoded": decoded
            }).encode('utf-8'))
        except jwt.ExpiredSignatureError:
            self.send_response(401)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error": "JWT has expired"}).encode('utf-8'))
        except jwt.InvalidTokenError:
            self.send_response(401)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error": "Invalid JWT"}).encode('utf-8'))

# Start the server
def run(server_class=HTTPServer, handler_class=FileServerHandler, port=80):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print(f"Serving files in the current directory and handling JWTs on port {port}")
    httpd.serve_forever()

if __name__ == '__main__':
    run()
