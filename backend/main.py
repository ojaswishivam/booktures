from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.upload import router
from fastapi.staticfiles import StaticFiles


app = FastAPI()

#allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/images", StaticFiles(directory="generated_images"), name="images")

app.include_router(router)

@app.get("/")
def home():
    return {"message": "Booktures backend running!"}