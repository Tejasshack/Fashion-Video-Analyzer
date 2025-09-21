# analyze_video_fast.py
import sys
import json
from pathlib import Path
from uuid import uuid4
import ffmpeg
import cv2
from faster_whisper import WhisperModel
from ultralytics import YOLO
from tqdm import tqdm

# Optional: import ollama for summary generation (single call)
try:
    import ollama
except Exception:
    ollama = None

def ensure_dir(p: Path):
    p.mkdir(parents=True, exist_ok=True)

def extract_sampled_frames(video_path: str, out_dir: Path, sample_rate_sec: float = 1.0):
    """
    Sample frames at sample_rate_sec and return list of file paths.
    We'll do a second pass for scene-change filtering.
    """
    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0)
    duration = total_frames / fps if fps else 0.0

    interval = max(1, int(round(fps * sample_rate_sec)))
    idx = 0
    saved = []
    frame_index = 0
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        if idx % interval == 0:
            out = out_dir / f"frame_{frame_index}.jpg"
            cv2.imwrite(str(out), frame)
            saved.append(out)
            frame_index += 1
        idx += 1
    cap.release()
    return saved, duration, fps

def filter_scene_change(frames, diff_threshold=0.5, min_consecutive=1):
    """
    Keep frames that are visually different from previous using hist comparison.
    diff_threshold (0..1): higher -> more sensitive. We use correlation metric.
    Returns filtered list (Path objects).
    """
    if not frames:
        return []
    def hist_of(img_path):
        img = cv2.imread(str(img_path))
        if img is None:
            return None
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        h = cv2.calcHist([hsv], [0,1], None, [50,60], [0,180,0,256])
        cv2.normalize(h, h)
        return h

    kept = []
    prev_h = hist_of(frames[0])
    if prev_h is not None:
        kept.append(frames[0])
    for p in frames[1:]:
        h = hist_of(p)
        if h is None:
            continue
        # compareHist returns correlation in [-1,1]; higher is more similar
        sim = cv2.compareHist(prev_h, h, cv2.HISTCMP_CORREL)
        # convert to dissimilarity in [0..1]
        dissim = 1.0 - max(-1.0, min(1.0, sim)) / 1.0
        if dissim >= diff_threshold:
            kept.append(p)
            prev_h = h
    return kept

def run_yolo_on_frames(model, frame_paths, batch_size=16, conf=0.25):
    """
    Run YOLO model in batch (ultralytics) and return detection summaries per frame.
    Output: list of dicts {frame: str, objects: [{name, conf, box}], raw: result}
    """
    results = model.predict(source=[str(p) for p in frame_paths], imgsz=640, conf=conf, verbose=False, batch=batch_size)
    output = []
    for p, r in zip(frame_paths, results):
        # r.boxes gives boxes; r.names is map id->label
        boxes = []
        if hasattr(r, 'boxes') and r.boxes is not None:
            for box in r.boxes:
                cls = int(box.cls[0]) if hasattr(box, 'cls') else None
                name = r.names[cls] if cls is not None and cls in r.names else str(cls)
                conf_score = float(box.conf[0]) if hasattr(box, 'conf') else None
                xyxy = [float(x) for x in box.xyxy[0]] if hasattr(box, 'xyxy') else None
                boxes.append({"label": name, "conf": conf_score, "box": xyxy})
        output.append({"frame": str(p), "objects": boxes})
    return output

def extract_audio(video_path: str, audio_out: Path):
    try:
        (
            ffmpeg
            .input(video_path)
            .output(str(audio_out), ac=1, ar='16000', format='wav')
            .overwrite_output()
            .run(quiet=True)
        )
        return True
    except Exception as e:
        print("ffmpeg failed:", e)
        return False

def transcribe_audio(audio_path: str, model_size="small.en", device="cpu"):
    model = WhisperModel(model_size, device=device)
    segments, _ = model.transcribe(audio_path)
    return " ".join([s.text for s in segments])

def compress_visuals(detections, top_k=5):
    """
    Compress object detections into short human-readable bullet points.
    groups by label across frames.
    """
    freq = {}
    for d in detections:
        for obj in d['objects']:
            lbl = obj['label']
            freq[lbl] = freq.get(lbl, 0) + 1
    sorted_labels = sorted(freq.items(), key=lambda x: -x[1])
    top = sorted_labels[:top_k]
    bullets = [f"{lbl}: {count} occurrences" for lbl, count in top]
    return "\n".join(bullets)

def generate_summary_with_ollama(transcript, visuals_summary):
    if not ollama:
        return "[ollama not installed or unavailable]"
    prompt = f"""\nTranscript (short):\n{transcript[:2000]}\n\nVisuals summary:\n{visuals_summary}\n\nCreate a concise IDEO-style summary (10-20 sentences) covering setting, main actions, and noteworthy moments.\n"""
    try:
        resp = ollama.chat(  model="llama3.2-vision", messages=[{"role":"user","content":prompt}])
        return resp.get("message", {}).get("content") or resp.get("content") or str(resp)
    except Exception as e:
        return f"[ollama error: {e}]"

def main():
    if len(sys.argv) < 3:
        print("Usage: python analyze_video_fast.py <video.mp4> <output.json> [device]")
        sys.exit(2)
    video = sys.argv[1]
    out_json = sys.argv[2]
    device = "cpu"
    if len(sys.argv) >= 4:
        device = sys.argv[3]

    tmp = Path("tmp_fast") / uuid4().hex
    ensure_dir(tmp)
    frames_dir = tmp / "frames"
    ensure_dir(frames_dir)

    # 1) sample frames (e.g., 1s)
    sampled, duration, fps = extract_sampled_frames(video, frames_dir, sample_rate_sec=1.0)
    print("Sampled frames:", len(sampled), "duration:", duration)

    # 2) scene-change filtering (reduce frames further)
    key_frames = filter_scene_change(sampled, diff_threshold=0.45)  # tweak threshold
    print("Scene-change key frames:", len(key_frames))

    # 3) YOLO analysis (batch)
    yolo = YOLO("yolov8n.pt")  # small, fast model
    detections = run_yolo_on_frames(yolo, key_frames, batch_size=16, conf=0.25)

    # 4) audio extraction + transcription
    audio_f = tmp / "audio.wav"
    ok = extract_audio(video, audio_f)
    transcript = ""
    if ok and audio_f.exists():
        transcript = transcribe_audio(str(audio_f), model_size="small.en", device=device)
    else:
        transcript = "[audio extraction failed]"

    # 5) compress visuals and optionally generate summary with Ollama
    visuals_summary = compress_visuals(detections, top_k=8)
    summary = generate_summary_with_ollama(transcript, visuals_summary) if ollama else "[ollama not available for summary]"

    result = {
        "duration": duration,
        "fps": fps,
        "num_sampled_frames": len(sampled),
        "num_key_frames": len(key_frames),
        "key_frames": [str(p) for p in key_frames],
        "detections": detections,
        "visuals_summary": visuals_summary,
        "transcript": transcript,
        "summary": summary
    }

    Path(out_json).parent.mkdir(parents=True, exist_ok=True)
    with open(out_json, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    print("Done:", out_json)

if __name__ == "__main__":
    main()
