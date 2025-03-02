from diffusers import StableDiffusionPipeline
import torch
import os

# Load the model
pipe = StableDiffusionPipeline.from_pretrained("stablediffusionapi/anything-v5")
pipe = pipe.to("mps")  # Use MPS backend on M1 Pro

# Generate a low-res image
# prompt = "A solo portrait of Mid-thirties Gender: Male Hair Style: Short, slicked-back black hair with a slightly tousled look on either side and a small stubble. Facial Features: - Eyes: Bright, striking blue eyes framed by thick white eyeliner that creates an almost ghostly effect. The pupils are perfectly round and piercing, never losing focus. - Nose: A slender, slightly upturned nose with a hint of humor etched into the corners. - Mouth: Always smiling playfully, lips slightly curved in a sardonic grin, revealing faint tooth marks from constant laughter at his own jokes. Teeth are white and even, not too perfect but polished to perfection. - Forehead: A slight crown of hair just above the brow ridge, giving him a regal look. - Ears: Large, almost comically proportioned ears with delicate earlobes that dangle slightly when he smiles. Clothing: - The character wears a custom-fitted suit made from rich fabrics like silk or velvet, which contrasts beautifully against his white shirt and black trousers. - His jacket is fitted perfectly with the short haircut, and it features a subtle contrast of deep indigo at the cuffs to add some depth in darker tones. The jacket has multiple pockets that he often uses for various items or as props. - He wears an elegant bowtie that matches the outfit, but his tie ends slightly longer than necessary, suggesting an almost carefree disregard for formality. Accessories: - On a chain around his neck is a silver pocket watch, casually worn and never missing. It's always visible under his suit collar, adding to the overall polished look. - A small, intricately designed locket hangs from another chain, often touching one of his ears. The design inside is enigmatic; sometimes it shows him as an older character with a more somber expression, other times it depicts him during the party at the Plaza Hotel."
# prompt = "Daisy was a tall woman with blonde hair, blue eyes, fair skin, and wore a simple dress that complemented her striking appearance. Her gender could not be determined from the provided information, but she is female based on context clues in the text."
# prompt = "Nick Carraw describes Gatsby as an older man with olive skin, dark eyes, and tousled dark brown hair, wearing a tattered suit that rustles slightly when he moves. A solo portrait."
prompt = "The Ghost of Christmas Present is depicted as an old man with wrinkled skin and a ghastly pale face, dressed in worn-out clothes that seem to be torn from different garments. His eyes are perpetually dark and full of sorrow, often glowing with an eerie light."
with torch.no_grad():
    print("Generating image...")
    images = pipe(prompt, height=512, width=512, negative_prompt="NSFW, text, cropped, low quality").images

# Save the image
for i, image in enumerate(images):  # Iterate over the images:
    print("Saving image...")
    image.save(os.path.join("images", "img" + str(i) + ".png"))
