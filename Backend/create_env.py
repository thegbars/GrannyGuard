import cv2
import numpy as np
import os
import json
from ultralytics import YOLO
import time

USER = "ofinucan7"
PW = "@ndrewCutch13!"
CAM_IDS = {"cam1": "192.168.1.184"}
CAM_URLS = [("Cam 1", f"rtsp://{USER}:{PW}@{CAM_IDS['cam1']}:554/stream1")]
SAVED_JSON_NAME = "cam_1_mapping.json"   
YOLO_CONF = 0.45  

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
# freeze then mark midpoint of squares
def capture_and_mark(frame, out_path):
    pts_img = []

    # mouse event
    def on_mouse(event, x, y, flags, param):
        if event == cv2.EVENT_LBUTTONDOWN:
            pts_img.append((x, y))

    cv2.namedWindow("click midpoints")
    cv2.setMouseCallback("click midpoints", on_mouse)

    while True:
        frame_copy = frame.copy()
        for i, (x, y) in enumerate(pts_img):
            cv2.circle(frame_copy, (x, y), 6, (0, 255, 255), -1)
        cv2.imshow("click midpoints", frame_copy)

        key = cv2.waitKey(1) & 0xFF
        if key == 27: 
            break
        elif key == ord('s'):
            pts_world = []
            for i in range(len(pts_img)):
                while True:
                    X, Y = map(float, input(f"coords for num {i+1}: ").strip().split())
                    pts_world.append((X, Y))
                    break
            img_np   = np.array(pts_img,   np.float32)
            world_np = np.array(pts_world, np.float32)

            H, _ = cv2.findHomography(img_np, world_np, cv2.RANSAC, 3.0)
            if H is None:
                print("bad")

            proj = cv2.perspectiveTransform(img_np.reshape(-1,1,2), H).reshape(-1,2)
            rmse = float(np.sqrt(np.mean( (proj-world_np)**2) ))

            h, w = frame.shape[:2]
            data = {
                "width": int(w),
                "height": int(h),
                "H": H.tolist(),
                "image_points": pts_img,
                "world_points": pts_world,
                "rmse_world_units": rmse
            }
            with open(out_path, "w") as f:
                json.dump(data, f, indent=2)
            print(f"saved to {out_path}")
            break

    cv2.destroyWindow("click midpoints")

# --------------------------------------------
captures = []
for cam_name, cam_url in CAM_URLS:
    capture = cv2.VideoCapture(cam_url, cv2.CAP_FFMPEG)
    if not capture.isOpened():
        raise RuntimeError(f"issue with {cam_name}")
    captures.append((cam_name, capture))

yolo_model = YOLO("yolov8n.pt")
CAM_JSON_DATA = read_json(SAVED_JSON_NAME) if os.path.exists(SAVED_JSON_NAME) else None
last_print = 0.0
ema_x_cam2 = None
ema_y_cam2 = None
smoothing_alpha = 0.8  
last_frames = {}  

while True:
    for idx, (name, cap) in enumerate(captures):
        ok, frame = cap.read()
        if not ok:
            print(f"struggling to grab {name}")
            continue

        if CAM_JSON_DATA is not None:
            run_yolo = yolo_model.predict(frame, imgsz=640, conf=YOLO_CONF, classes=[0], verbose=False)[0]
            foot_pixel = None

            # just grab the largest box bkjbkhjvkytghcvjtrgfhdcvjythgnc
            if len(run_yolo.boxes) > 0:
                areas = []
                for b in run_yolo.boxes:
                    x1,y1,x2,y2 = b.xyxy[0].cpu().numpy().tolist()
                    areas.append((x2-x1)*(y2-y1))
                max_area = int(np.argmax(areas))
                x1,y1,x2,y2 = run_yolo.boxes[max_area].xyxy[0].cpu().numpy().tolist()
                mp = (x1 + x2) / 2.0
                y_val = y2
                foot_pixel = (mp, y_val)
                cv2.rectangle(frame, (int(x1),int(y1)), (int(x2),int(y2)), (0,255,0), 2)
                cv2.circle(frame, (int(mp), int(y_val)), 4, (0,255,255), -1)

            if foot_pixel is not None:
                x, y = pixel_to_coord(CAM_JSON_DATA, *foot_pixel)
                ema_x_cam2 = x if ema_x_cam2 is None else smoothing_alpha*ema_x_cam2 + (1-smoothing_alpha)*x
                ema_y_cam2 = y if ema_y_cam2 is None else smoothing_alpha*ema_y_cam2 + (1-smoothing_alpha)*y
                now = time.time()
                if now - last_print >= 3.0:
                    print(f"person @ ({ema_x_cam2:.1f}, {ema_y_cam2:.1f})")
                    last_print = now
            else:
                now = time.time()
                if now - last_print >= 3.0:
                    print("no person")
                    last_print = now

        cv2.imshow(f"{name} - frame", frame)
        last_frames[idx] = (name, frame.copy())

    # esc to get out
    key = cv2.waitKey(1) & 0xFF
    if key == 27:
        break

    if ord('1') <= key <= ord(str(min(9, len(captures)))):
        idx = key-ord('1')
        if idx in last_frames:
            cam_name, frozen = last_frames[idx]
            safe = cam_name.lower().replace(" ", "_")
            out_json = f"{safe}_mapping.json"
            capture_and_mark(frozen, out_json)


for _, cap in captures:
    cap.release()
cv2.destroyAllWindows()
