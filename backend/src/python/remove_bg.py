#!/usr/bin/env python3
import sys
import argparse
from pathlib import Path

try:
    from rembg import remove
    from PIL import Image
except ImportError as e:
    print(f"Error: Required module not found: {e}", file=sys.stderr)
    sys.exit(1)

def hex_to_rgb(hex_color):
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

def remove_background(input_path, output_path, bg_color=None):
    try:
        input_image = Image.open(input_path)
        output_image = remove(input_image)
        
        if bg_color and bg_color.lower() != 'transparent':
            if output_image.mode != 'RGBA':
                output_image = output_image.convert('RGBA')
            rgb_color = hex_to_rgb(bg_color)
            background = Image.new('RGBA', output_image.size, rgb_color + (255,))
            background.paste(output_image, (0, 0), output_image)
            output_image = background.convert('RGB')
        
        output_image.save(output_path, format='PNG')
        return True
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        return False

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--input', required=True)
    parser.add_argument('--output', required=True)
    parser.add_argument('--bg_color', default=None)
    args = parser.parse_args()
    
    if remove_background(args.input, args.output, args.bg_color):
        print(f"Success: {args.output}")
    else:
        sys.exit(1)

if __name__ == '__main__':
    main()
