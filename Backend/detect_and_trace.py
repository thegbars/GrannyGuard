import cv2
import numpy as np
import os
import json
import time
import requests
import base64
import msvcrt
from collections import deque
from ultralytics import YOLO
from dotenv import load_dotenv
from pathlib import Path
from urllib.parse import quote

load_dotenv(dotenv_path=Path(__file__).parent / ".env", override=True)

BACKEND_URL = "http://127.0.0.1:8000" 
ITEM_NAME_MAP = {
    "wallet": "wallet",
    "keys": "keys",
    "sunglasses": "sunglasses",
    "orange_pill_bottle": "pill_bottle",
    "pillbottle": "pill_bottle",
    "pill_bottle": "pill_bottle",
    "orangepill": "pill_bottle",
    "allegra": "alegra",
    "alegra": "alegra",
}

USER = os.getenv("USERNAME")
PW = os.getenv("PASSWORD")
CAM_IDS = {"cam1": os.getenv("CAM_1_IP"), "cam2": os.getenv("CAM_2_IP"), "cam3": os.getenv("CAM_3_IP"), "cam4": os.getenv("CAM_4_IP")}
ROBOFLOW_API_KEY = os.getenv("ROBOFLOW_API_KEY")
ROBOFLOW_WORKFLOW_URL = (
    "https://serverless.roboflow.com/infer/workflows/steelhacks/find-wallets-alegras-sunglasses-orangepills-and-keys"
)
CALL_ROBOFLOW = 180
ROBOFLOW_MIN_CONF = 0.40

# cam 4 --> hallway (1)
# cam 3 --> fridge (2)
# cam 2 --> sink / stove (3!) 
# cam 1 --> overhead (4!)

CAMERA_INFO = [
    ("Cam 1", f"rtsp://{USER}:{PW}@{CAM_IDS['cam1']}:554/stream1", "cam_4_mapping.json"),
    ("Cam 2", f"rtsp://{USER}:{PW}@{CAM_IDS['cam2']}:554/stream1", "cam_3_mapping.json"),
    ("Cam 3", f"rtsp://{USER}:{PW}@{CAM_IDS['cam3']}:554/stream1", "cam_2_mapping.json"),
    ("Cam 4", f"rtsp://{USER}:{PW}@{CAM_IDS['cam4']}:554/stream1", "cam_1_mapping.json"),
]

YOLO_MODEL = "yolov8n.pt"
YOLO_CONF = 0.45
PERSON_CLASS_ID = 0
PRINT_EVERY = 3 # seconds
SMOOTHING_ALPHA   = 0.8
MAX_DISTANCE = 36
FRAMES_WITHOUT_UPDATE = 30

# ------------------------------------------
# roboflow garbage
# yuck yuck yuck
def jpeg_base64_of(frame_bgr) -> str:
    ok, buf = cv2.imencode(".jpg", frame_bgr, [int(cv2.IMWRITE_JPEG_QUALITY), 90])
    if not ok:
        raise RuntimeError("cant encode jpeg")
    return base64.b64encode(buf).decode("ascii")

def first_number(*vals, default=None):
    for v in vals:
        if v is None:
            continue
        try:
            f = float(v)
            return f
        except Exception:
            continue
    return default

def extract_detections(obj):
    out = []
    if isinstance(obj, dict):
        for k, v in obj.items():
            if k.lower() in ("predictions", "detections", "objects", "items") and isinstance(v, list):
                out.extend(v)
            else:
                out.extend(extract_detections(v))
    elif isinstance(obj, list):
        for v in obj:
            out.extend(extract_detections(v))
    return out

def go_roboflow(frame_bgr, H_for_cam, cam_name, timeout=20, min_conf=None):
    if min_conf is None:
        min_conf = globals().get("ROBOFLOW_MIN_CONF", 0.0)

    if not ROBOFLOW_API_KEY or ROBOFLOW_API_KEY == "YOUR_API_KEY_HERE":
        print("[ItemScan] No ROBOFLOW_API_KEY set; skipping")
        return []

    h0, w0 = frame_bgr.shape[:2]
    scale = min(1.0, 1280.0 / max(w0, h0))
    frame_send = frame_bgr if scale >= 1.0 else cv2.resize(
        frame_bgr, (int(w0 * scale), int(h0 * scale)), interpolation=cv2.INTER_AREA
    )

    b64 = jpeg_base64_of(frame_send)
    payload = {
        "api_key": ROBOFLOW_API_KEY,
        "inputs": {
            "image": {"type": "base64", "value": b64}
        }
    }

    try:
        r = requests.post(ROBOFLOW_WORKFLOW_URL, json=payload, timeout=timeout)
    except Exception as e:
        print(f"roboflow issue w/ {cam_name}")
        return []

    if r.status_code != 200:
        print(f"{cam_name}] issue ; {r.status_code}")
        return []

    try:
        data = r.json()
    except Exception:
        print(f"{cam_name} got non json")
        return []

    dets = extract_detections(data)
    if not dets:
        print(f"{cam_name} found nothing")
        return []

    results = []
    for d in dets:
        label_raw = (d.get("class") or d.get("label") or d.get("name") or "item").lower().replace(" ", "_")
        canonical = ITEM_NAME_MAP.get(label_raw, label_raw)
        conf = first_number(d.get("confidence"), d.get("score"), d.get("probability"), default=None)
        if conf is not None and conf < min_conf:
            continue

        bbox = d.get("bbox") or {}
        x = first_number(d.get("x"), d.get("cx"), d.get("center_x"), bbox.get("x"), bbox.get("cx"))
        y = first_number(d.get("y"), d.get("cy"), d.get("center_y"), bbox.get("y"), bbox.get("cy"))
        w = first_number(d.get("width"), d.get("w"), bbox.get("width"), bbox.get("w"))
        h = first_number(d.get("height"), d.get("h"), bbox.get("height"), bbox.get("h"))

        if x is not None and h is not None and H_for_cam is not None:
            bottom_u = x / scale
            bottom_v = ((y if y is not None else 0.0) + (h / 2.0)) / scale
            try:
                Xw, Yw = pixel_to_coord(H_for_cam, bottom_u, bottom_v)
                results.append({
                    "item": canonical,
                    "x": float(Xw),
                    "y": float(Yw),
                    "source_cam": cam_name,
                    "conf": float(conf) if conf is not None else None,
                })
            except Exception:
                pass 

    if not results:
        print(f"{cam_name} got nothing")
    else:
        for r in results:
            print(f"{cam_name} --> {r['item']} @ {r['x']:.1f},{r['y']:.1f})")

    return results

def post_items(items_batch):
    if not items_batch: 
        return
    try:
        requests.post(f"{BACKEND_URL}/locations/items",
                      json={"items": items_batch},
                      timeout=2.5)
    except Exception as e:
        print("posting items broke", e)

# --------------------------------------------
# read in the json file
def read_json(json_path):
    with open(json_path, "r") as f:
        data = json.load(f)
    return np.array(data["H"], dtype=np.float32)

# --------------------------------------------
# take image pixel --> real coords
def pixel_to_coord(img, mp, y_val):
    pixel = np.array([[[mp, y_val]]], dtype=np.float32)
    x, y = cv2.perspectiveTransform(pixel, img)[0, 0]
    return float(x), float(y)

# --------------------------------------------
# method solely to grab the largest box because of towels
def grab_big_bird(frame, model, conf=0.45):
    run_yolo = model.predict(frame, imgsz=640, conf=conf, classes=[PERSON_CLASS_ID], verbose=False)[0]
    
    # get nothing --> return nothing
    if len(run_yolo.boxes) == 0:
        return None, None, None
    
    areas = []
    for birds in run_yolo.boxes:
        x1,y1,x2,y2 = birds.xyxy[0].cpu().numpy().tolist()
        areas.append((x2-x1)*(y2-y1))
    max_area = int(np.argmax(areas))
    big_bird = run_yolo.boxes[max_area]
    x1,y1,x2,y2 = big_bird.xyxy[0].cpu().numpy().tolist()
    mp = (x1 + x2) / 2.0
    y_val = y2
    confidence = float(big_bird.conf[0].cpu().numpy())
    return (mp, y_val), (x1, y1, x2, y2), confidence

# --------------------------------------------
# camera manager for if more than 1 cam picks up a person - maybe works?
class CameraManager:
    def __init__(self, max_distance, frames_without_update, smoothing_alpha, print_time):
        self.max_dist = max_distance
        self.frame_wo_update = frames_without_update
        self.smoothing_alpha = smoothing_alpha
        self.print_time = print_time
        self.next_id = 1
        self.tracks = {}

    @staticmethod
    def point_dist(a, b):
        return float(np.hypot(a[0]-b[0], a[1]-b[1]))

    def update(self, measurements, cur_time):
        for t in self.tracks.values():
            t["age"] += 1
            t["updated"] = False

        unused = set(range(len(measurements)))
        for track_id in sorted(self.tracks.keys()):
            cur_track = self.tracks[track_id]
            best_index, best_dist = None, 1e9
            for i in unused:
                cur_measure = measurements[i]
                cur_dist = self.point_dist((cur_track["x"], cur_track["y"]), (cur_measure["x"], cur_measure["y"]))
                if cur_dist < best_dist:
                    best_dist, best_index = cur_dist, i
            if best_index is not None and best_dist <= self.max_dist:
                cur_measure = measurements[best_index]
                cur_track["x"] = self.smoothing_alpha*cur_track["x"] + (1-self.smoothing_alpha)*cur_measure["x"]
                cur_track["y"] = self.smoothing_alpha*cur_track["y"] + (1-self.smoothing_alpha)*cur_measure["y"]
                cur_track["age"] = 0
                cur_track["trail"].append((cur_track["x"], cur_track["y"]))
                cur_track["last_cam"]  = cur_measure["cam"]
                cur_track["last_conf"] = cur_measure.get("conf", 0.0)
                cur_track["updated"] = True
                unused.remove(best_index)

        for i in unused:
            cur_measure = measurements[i]
            track_id = self.next_id; self.next_id += 1
            self.tracks[track_id] = {
                "x": cur_measure["x"], "y": cur_measure["y"], "age": 0,
                "trail": deque([(cur_measure["x"], cur_measure["y"])], maxlen=40),
                "last_cam": cur_measure["cam"], "last_conf": cur_measure.get("conf", 0.0),
                "last_print": 0.0,
                "updated": True
            }

        self.tracks = {track_id:track for track_id,track in self.tracks.items() if track["age"] <= self.frame_wo_update}
        return self.tracks

    # you're guess is as good as mine if its right
    def maybe_print(self, cur_time):
        for track_id, track in self.tracks.items():
            if not track.get("updated", False):
                continue
            if cur_time - track["last_print"] >= self.print_time:
                print(f"({track['x']:.1f}, {track['y']:.1f}) on cam={track['last_cam']}")
                track["last_print"] = cur_time
# -------------------------------------------
# granny got run over by a reindeer
def post_granny(x, y, cam):
    try:
        requests.post(f"{BACKEND_URL}/location/granny",
                      json={"x": x, "y": y, "source_cam": cam},
                      timeout=1.5)
    except Exception as e:
        print("[POST /location/granny] failed:", e)

# --------------------------------------------
# driver
def driver():
    cameras = [] 
    for cam_name, cam_url, json_file in CAMERA_INFO:
        capture = cv2.VideoCapture(cam_url, cv2.CAP_FFMPEG)
        if not capture.isOpened():
            raise RuntimeError(f"{cam_name} broken")
        cameras.append({
            "name": cam_name,
            "capture": capture,
            "json_mapping": read_json(json_file),
            "last_print": 0.0,
            "ema_x": None,
            "ema_y": None
        })

    model = YOLO(YOLO_MODEL)
    multi_cam_manager = CameraManager(
        max_distance=MAX_DISTANCE,
        frames_without_update=FRAMES_WITHOUT_UPDATE, 
        smoothing_alpha=SMOOTHING_ALPHA,
        print_time=PRINT_EVERY
    )

    last_items_scan = time.time()
    force_item_scan = False

    while True:
        measurements = []
        now_loop = time.time()
        do_item_scan = force_item_scan or ((now_loop - last_items_scan) >= CALL_ROBOFLOW)

        best_item_by_name = {} 

        for cam in cameras:
            name = cam["name"]
            capture = cam["capture"]
            H = cam["json_mapping"]

            ok, frame = capture.read()
            if not ok:
                print(f"issue w/ {name}")
                continue

            if do_item_scan:
                roboflow_results = go_roboflow(frame, H, name, min_conf=ROBOFLOW_MIN_CONF) or []
                for roboflow_items in roboflow_results:
                    key = roboflow_items["item"]
                    prev = best_item_by_name.get(key)
                    if (prev is None) or ((roboflow_items.get("conf") or 0) > (prev.get("conf") or 0)):
                        best_item_by_name[key] = roboflow_items

            mp, bbox, confidence = grab_big_bird(frame, model, YOLO_CONF)
            if mp is None:
                continue
            xw, yw = pixel_to_coord(H, *mp)
            measurements.append({"x": xw, "y": yw, "cam": name, "conf": confidence})

        cur_time = time.time()
        tracks = multi_cam_manager.update(measurements, cur_time)
        multi_cam_manager.maybe_print(cur_time)

        best_tid = None
        best_conf = -1
        best_track = None
        for tid, t in tracks.items():
            if t.get("updated") and (t.get("last_conf", 0) > best_conf):
                best_conf = t.get("last_conf", 0)
                best_tid = tid
                best_track = t
        if best_track:
            post_granny(best_track["x"], best_track["y"], best_track["last_cam"])

        if do_item_scan:
            post_items(list(best_item_by_name.values()))
            last_items_scan = now_loop
            force_item_scan = False

        k = cv2.waitKey(1) & 0xFF
        if k == 27:  # esc
            break
        elif k in (ord('i'), ord('I')):
            force_item_scan = True

    for cam in cameras:
        cam["capture"].release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    driver()