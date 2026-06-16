from flask import Blueprint, jsonify

events_bp = Blueprint("events", __name__)

events = [
    {
        "id": 1,
        "type": "INSTALLATION",
        "user": "juan",
        "application": "Cisco Packet Tracer"
    }
]


@events_bp.route("/", methods=["GET"])
def get_events():
    return jsonify(events)