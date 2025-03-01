from diffusers import StableDiffusionPipeline
import torch
import os

# Load the model
pipe = StableDiffusionPipeline.from_pretrained("stable-diffusion-v1-5/stable-diffusion-v1-5")
pipe = pipe.to("mps")  # Use MPS backend on M1 Pro

# Generate a low-res image
prompt = "wealthy young man, clean shave, suit and tie, black hair, black eyes"
with torch.no_grad():
    print("Generating image...")
    images = pipe("dynamic pose, detailed face, single character avatar of " +prompt, height=512, width=512, negative_prompt="photorealistic, NSFW, sexualized, text, cropped image").images

# Save the image
for i, image in enumerate(images):  # Iterate over the images:
    print("Saving image...")
    image.save(os.path.join("images", "img" + str(i) + ".png"))
