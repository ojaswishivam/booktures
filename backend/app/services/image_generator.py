import os
import requests
from bytez import Bytez
from dotenv import load_dotenv
from PIL import Image

load_dotenv()

API_KEY = os.getenv("BYTEZ_API_KEY")
sdk = Bytez(API_KEY)

model = sdk.model("google/imagen-4.0-generate-001")


def generate_image(prompt, index, output_dir="generated_images"):
    os.makedirs(output_dir, exist_ok=True)

    filename = f"page_{index}.png"
    path = os.path.join(output_dir, filename)

    print(f"🎨 Generating image for page {index} using Bytez...")

    try:
        result = model.run(
            f"cinematic, ultra detailed, 4k, realistic: {prompt}"
        )

        if result.error:
            print("❌ Bytez Error:", result.error)
            raise Exception("Bytez failed")

        #  Handle output safely
        image_url = None

        if isinstance(result.output, str):
            image_url = result.output
        elif isinstance(result.output, list):
            image_url = result.output[0]
        elif isinstance(result.output, dict):
            image_url = result.output.get("image")

        if not image_url:
            raise Exception("Invalid image output")

        # 🔥 Download image
        response = requests.get(image_url, timeout=30)

        if response.status_code == 200:
            with open(path, "wb") as f:
                f.write(response.content)
        else:
            raise Exception("Download failed")

        print(f"✅ Saved: {path}")
        return path

    except Exception as e:
        print("⚠️ Fallback triggered:", e)

        # fallback image (so UI doesn't break)
        img = Image.new("RGB", (512, 512), color=(30, 30, 30))
        img.save(path)

        return path