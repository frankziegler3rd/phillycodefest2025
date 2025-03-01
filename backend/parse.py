import pdfplumber
import argparse

def pdf_to_text(pdf_path, txt_path):
    """
    Converts a PDF file to a text file while preserving paragraphs and necessary spacing.
    
    :param pdf_path: Path to the input PDF file.
    :param txt_path: Path to the output text file.
    """
    with pdfplumber.open(pdf_path) as pdf, open(txt_path, "w", encoding="utf-8") as txt_file:
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                txt_file.write(text + "\n\n")  # Preserve paragraph spacing

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Convert a PDF file to a text file while preserving spacing.")
    parser.add_argument("pdf_path", help="Path to the input PDF file.")
    parser.add_argument("txt_path", help="Path to the output text file.")
    
    args = parser.parse_args()
    
    pdf_to_text(args.pdf_path, args.txt_path)
    print(f"Converted '{args.pdf_path}' to '{args.txt_path}' successfully!")