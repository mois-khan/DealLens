import fitz  # PyMuPDF

def extract_text(pdf_bytes: bytes) -> str:
    """
    Extracts text from a PDF byte stream.
    Returns the concatenated text with slide markers.
    If the PDF is image-based, this will return an empty string.
    """
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    text = ""
    for i, page in enumerate(doc):
        page_text = page.get_text().strip()
        if page_text:
            text += f"\n--- SLIDE {i + 1} ---\n{page_text}\n"
    doc.close()
    return text.strip()
