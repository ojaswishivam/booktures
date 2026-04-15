
from fastapi import APIRouter, UploadFile, BackgroundTasks
import shutil
from app.services.pdf_parser import extract_pages
from app.services.prompt_engine import build_prompt
from app.services.image_generator import generate_image
import os

progress = {
    "current": 0,
    "total": 0,
    "status": "idle"
}

router = APIRouter()

def process_book(file_path):
    global progress

    pages = extract_pages(file_path)
    progress["total"] = len(pages)
    progress["current"] = 0
    progress["status"] = "processing"

    print(f"📄 Total pages: {len(pages)}")

    # clear old images
    for f in os.listdir("generated_images"):
        os.remove(os.path.join("generated_images", f))


    for i, page in enumerate(pages):
        prompt = build_prompt(page)
        generate_image(prompt, i)

        progress["current"] = i + 1

    progress["status"] = "done"

@router.post("/upload")
async def upload_pdf(file: UploadFile, background_tasks: BackgroundTasks):
    file_path = f"uploads/{file.filename}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    background_tasks.add_task(process_book, file_path)

    return {"status": "processing started"}


@router.get("/images")
def get_images():
    image_folder = "generated_images"
    image_files = sorted(
        os.listdir(image_folder),
        key=lambda x: int(x.split("_")[1].split(".")[0])
    )
    # get latest uploaded PDF
    upload_files = os.listdir("uploads")
    upload_files.sort(reverse=True)
    file_path = os.path.join("uploads", upload_files[0])

    pages = extract_pages(file_path)

    #for debugging
    print("IMAGES:", image_files)
    print("PAGES:", len(pages))

    result = []

    for i, img in enumerate(image_files):
        result.append({
            "image": f"https://booktures-backend.onrender.com/images/{img}",
            "text": pages[i] if i < len(pages) else ""
        })

    return {"data": result}

@router.get("/progress")
def get_progress():
    return progress