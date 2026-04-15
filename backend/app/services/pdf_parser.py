import fitz  
import re


def clean_text(text):
    text = re.sub(r'\b[Pp]age\s*\d+\b', '', text)
    text = re.sub(r'\n+', '\n', text).strip()
    return text


def extract_pages(file_path):
    doc = fitz.open(file_path)
    pages = []

    for page in doc:
        text = page.get_text()
        cleaned = clean_text(text)
        pages.append(cleaned)

    return pages