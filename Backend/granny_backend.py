import json
import os
import tempfile
import threading
import statistics
import secrets
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from pathlib import Path
from datetime import datetime, timezone
from zoneinfo import ZoneInfo
from fastapi.staticfiles import StaticFiles
from pathlib import Path

BASE_DIR = Path(__file__).parent.resolve()
DATA_DIR = BASE_DIR / "data"
MEDIA_DIR = DATA_DIR / "pictures"
MEDIA_DIR.mkdir(parents=True, exist_ok=True)
TIMEZONE = "America/New_York"

app = FastAPI(title="Granny Guardian")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"],)
app.mount("/media", StaticFiles(directory=str(MEDIA_DIR)), name="media")

# ---------------------
# schemas/class
class ReminderIn(BaseModel):
    text: str
    due_at: Optional[str] = None
    urgency: Optional[str] = "normal"

class PictureIn(BaseModel):
    name: str = Field(min_length=1)

class GrannyLocation(BaseModel):
    x: Optional[float] = None
    y: Optional[float] = None
    updated_at: Optional[str] = None
    source_cam: Optional[str] = None

class ItemLocation(BaseModel):
    item: str
    x: float
    y: float

class Reminder(BaseModel):
    id: int
    text: str
    due_at: Optional[str] = None
    created_at: str

class HealthMetric(BaseModel):
    name: str
    value: float
    unit: str
    is_outlier: bool = False

class HealthResponse(BaseModel):
    metrics: List[HealthMetric]
    outliers: List[str]

class ItemLocation(BaseModel):
    item: str
    x: float
    y: float
    updated_at: Optional[str] = None
    source_cam: Optional[str] = None
    conf: Optional[float] = None

class GrannyUpdate(BaseModel):
    x: float
    y: float
    source_cam: Optional[str] = None

class ItemUpsert(BaseModel):
    item: str
    x: float
    y: float
    source_cam: Optional[str] = None
    conf: Optional[float] = None

class ItemUpsertBatch(BaseModel):
    items: List[ItemUpsert]

# -------------------------------------
# json stores
class JSONStore:
    def __init__(self, path, default):
        self.path = Path(path)
        self.lock = threading.Lock()
        if not self.path.exists():
            self.atomic_write(default)

    def atomic_write(self, data: Any):
        tmp = self.path.with_suffix(self.path.suffix + ".tmp")
        with open(tmp, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
        os.replace(tmp, self.path)

    def read(self):
        with self.lock:
            with open(self.path, "r", encoding="utf-8") as f:
                return json.load(f)

    def write(self, data: Any):
        with self.lock:
            self.atomic_write(data)

pictures_store  = JSONStore(DATA_DIR / "pictureList.json", default=[])
reminders_store = JSONStore(DATA_DIR / "reminders.json",   default=[
    {"id": 1, "text": "Take morning meds", "due_at": None, "created_at": datetime.now(timezone.utc).isoformat().replace("+00:00","Z")},
])
items_store = JSONStore(DATA_DIR / "items.json", default=[
    {"item": "wallet", "x": 140,  "y": 75,  "updated_at": None},
    {"item": "keys", "x": 91,  "y": 136,  "updated_at": None},
    {"item": "sunglasses", "x": 120, "y": 208, "updated_at": None},
    {"item": "pill_bottle", "x": 110, "y": 208, "updated_at": None},
    {"item": "alegra","x": 110, "y": 13, "updated_at": None},
])
granny_store = JSONStore(DATA_DIR / "granny_location.json", default={
    "x": 0, "y": 0, "room": None, "updated_at": None, "source_cam": None
})

# -------------------------------------
def pick_lucide_icon(timezone):
    h = timezone.hour
    if 5 <= h < 7:   return "Sunrise"
    if 7 <= h < 18:  return "Sun"
    if 18 <= h < 20: return "Sunset"
    return "Moon"

def gather_time_info():
    zone = ZoneInfo(TIMEZONE)
    date_time = datetime.now(zone)
    return {
        "iso": date_time.isoformat(),
        "date": date_time.strftime("%Y-%m-%d"),
        "time_24h": date_time.strftime("%H:%M"),
        "time_12h": date_time.strftime("%I:%M %p"),
        "weekday": date_time.strftime("%A"),
        "timezone": str(zone),
        "icon": pick_lucide_icon(date_time)
    }

@app.get("/time")
def get_time():
    return gather_time_info()

@app.post("/reminders", response_model=Reminder, status_code=201)
def create_reminder(body: ReminderIn):
    rems = reminders_store.read()
    new_id = (max((r["id"] for r in rems), default=0) + 1)
    obj = {
        "id": new_id,
        "text": body.text,
        "due_at": body.due_at,
        "created_at": datetime.now(timezone.utc).isoformat(), 
        "urgency": body.urgency or "normal",
    }
    rems.append(obj)
    reminders_store.write(rems)
    return obj
@app.get("/reminders", response_model=List[Reminder])
def get_reminders():
    return reminders_store.read()

# -----------------------
# pictures
ALLOWED_EXT = {".png", ".jpg", ".jpeg", ".webp"}

@app.post("/pictures", status_code=201)
def add_picture(picture: PictureIn):
    data = pictures_store.read()
    data.append(picture.name)
    pictures_store.write(data)
    return {"ok": True, "count": len(data)}

@app.get("/pictures", response_model=List[str])
def list_pictures():
    return pictures_store.read()

@app.post("/pictures/upload")
def upload_picture(file: UploadFile = File(...)):
    suffix = Path(file.filename).suffix.lower()
    if suffix not in ALLOWED_EXT:
        raise HTTPException(status_code=400, detail="bad file type")

    safe_name = f"{secrets.token_hex(8)}{suffix}"
    dest = MEDIA_DIR / safe_name
    with open(dest, "wb") as f:
        f.write(file.file.read())

    data = pictures_store.read()
    data.append(safe_name)
    pictures_store.write(data)

    return {"ok": True, "name": safe_name, "url": f"/media/{safe_name}"}
# --------------------------
@app.post("/location/granny", response_model=GrannyLocation)
def set_granny_location(body: GrannyUpdate):
    data = granny_store.read()
    data.update({
        "x": body.x,
        "y": body.y,
        "source_cam": body.source_cam,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    })
    granny_store.write(data)
    return data

@app.get("/location/granny", response_model=GrannyLocation)
def get_granny_location():
    return granny_store.read()

@app.post("/locations/items", response_model=List[ItemLocation])
def upsert_items(body: ItemUpsertBatch):
    data = items_store.read()
    by_item = {d["item"].lower(): d for d in data}
    now = datetime.now(timezone.utc).isoformat()

    for it in body.items:
        key = it.item.lower()
        rec = by_item.get(key)
        if rec:
            rec.update({
                "x": it.x, "y": it.y,
                "source_cam": it.source_cam,
                "conf": it.conf,
                "updated_at": now,
            })
        else:
            by_item[key] = {
                "item": key, "x": it.x, "y": it.y,
                "source_cam": it.source_cam,
                "conf": it.conf,
                "updated_at": now,
            }

    out = list(by_item.values())
    items_store.write(out)
    return out

@app.get("/locations/items", response_model=List[ItemLocation])
def list_item_locations():
    return items_store.read()
