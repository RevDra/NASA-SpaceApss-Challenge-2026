# Server FastAPI mở cổng cho Frontend gọi


from pathlib import Path
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fits_pipeline import CACHE_DIR, run_full_sky_pipeline

app = FastAPI(title="SPHEREx Sky Viewer Backend")

# Cho phép Frontend (index.html mở qua Live Server hoặc port khác) gọi API thoải mái
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Phục vụ trực tiếp ảnh PNG đã xử lý trong thư mục backend/cache
app.mount("/cache", StaticFiles(directory=str(CACHE_DIR)), name="cache")


@app.get("/api/observations")
def get_observations(
    ra: float = Query(..., description="Right Ascension (degrees)"),
    dec: float = Query(..., description="Declination (degrees)"),
    bandpass: str = Query("SPHEREx-D6", description="SPHEREx-D1 .. SPHEREx-D6"),
    size: float = Query(0.05, description="Field of view (degrees)"),
):
    return run_full_sky_pipeline(
        ra_deg=ra, dec_deg=dec, bandpass=bandpass, size_deg=size
    )