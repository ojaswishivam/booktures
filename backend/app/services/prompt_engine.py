import re

def clean_text(text):
    #  remove "Page 1", "page 2", etc.
    text = re.sub(r'\b[Pp]age\s*\d+\b', '', text)

    #  remove standalone numbers 
    text = re.sub(r'^\s*\d+\s*$', '', text, flags=re.MULTILINE)

    #  remove extra spaces/newlines
    text = re.sub(r'\n+', '\n', text).strip()

    return text


def build_prompt(text):
    text = clean_text(text)

    return f"""
    Create a cinematic, highly detailed visual, , scene based on this:

    {text}

    Style: realistic, 4k, dramatic lighting, no text in image
    """