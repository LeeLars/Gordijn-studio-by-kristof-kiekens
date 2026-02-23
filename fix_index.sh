#!/bin/bash
# Fix script for root index.html

FILE="/Users/larsleenders/Downloads/Kristof Kiekens/index.html"

# Fix 1: Add hero quote after hero-title div
sed -i '' 's|</div>\s*</div>\s*</div>\s*</div>\s*<div class="hero-overlap-content">|</div>\n                        <p class="hero-quote">"Elk detail telt, elk gordijn vertelt een verhaal"</p>\n                    </div>\n                </div>\n            </div>\n            <div class="hero-overlap-content">|g' "$FILE"

echo "Fixes applied"
