from flask import Flask
from routes.users import users_bp
from routes.apps import apps_bp
from routes.policies import policies_bp
from routes.events import events_bp

app = Flask(__name__)

# Registramos todo
app.register_blueprint(users_bp, url_prefix="/api/users")
app.register_blueprint(apps_bp, url_prefix="/api/apps")
app.register_blueprint(policies_bp, url_prefix="/api/policies")
app.register_blueprint(events_bp, url_prefix="/api/events")


@app.route("/")
def health():
    return {
        "status": "ok"
    }


if __name__ == "__main__":
    app.run(debug=True)