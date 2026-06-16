from flask import Blueprint, jsonify, request

apps_bp = Blueprint("apps", __name__)

applications = [
    {
        "id": 1,
        "name": "Cisco Packet Tracer",
        "category": "education",
        "approved": True,
        "sha256": "abc123"
    }
]


@apps_bp.route("/", methods=["GET"])
def get_apps():
    return jsonify(applications)


@apps_bp.route("/", methods=["POST"])
def add_app():
    data = request.get_json()

    app = {
        "id": len(applications) + 1,
        "name": data["name"],
        "category": data["category"],
        "approved": False,
        "sha256": data["sha256"]
    }

    applications.append(app)

    return jsonify(app), 201