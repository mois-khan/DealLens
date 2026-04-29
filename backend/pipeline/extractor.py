import fitz  # PyMuPDF
import logging

logger = logging.getLogger(__name__)


def extract_text(pdf_bytes: bytes) -> str:
    """
    Extract text from a PDF given as raw bytes.
    Returns slide-labelled plain text. Raises ValueError for image-only PDFs.
    """
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    text = ""
    for i, page in enumerate(doc):
        page_text = page.get_text().strip()
        if page_text:
            text += f"\n--- SLIDE {i + 1} ---\n{page_text}\n"
    doc.close()

    result = text.strip()
    if not result:
        raise ValueError("No extractable text found — PDF may be image-based.")

    return result
