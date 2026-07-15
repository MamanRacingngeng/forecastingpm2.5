from flask import Flask, jsonify, render_template
from lstm_engine import run_all_models

app = Flask(__name__)

_results_cache = None


def get_results():
    global _results_cache
    if _results_cache is None:
        _results_cache = run_all_models()
    return _results_cache


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/predict")
def predict():
    try:
        results = get_results()
        return jsonify({"success": True, "data": results})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/refresh")
def refresh():
    global _results_cache
    _results_cache = None
    try:
        results = get_results()
        return jsonify({"success": True, "data": results, "message": "Model berhasil dilatih ulang"})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
