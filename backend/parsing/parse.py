import pymupdf

# Basic function to grab ALL plain text from PDF textbook
#
# Params: pdf_path -- Path to PDF
# Return: text -- Full textbook in plain text
def extract_text_from_book(pdf_path):
    doc = pymupdf.open(pdf_path)
    text = ""
    for page_num in range(doc.page_count):
        page = doc.load_page(page_num)
        text += page.get_text("text")
    return text