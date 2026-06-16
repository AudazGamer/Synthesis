from flask import Blueprint, jsonify

policies_bp = Blueprint("policies", __name__)

policies = [
    {
        "id": 1,
        "name": "No videojuegos",
        "enabled": True
    }
]


@policies_bp.route("/", methods=["GET"])
def get_policies():
    return jsonify(policies)