# 🎨 MARKETPLACE ASSETS NEEDED

## ⚠️ CRITICAL: Add these assets before publishing to marketplace!

### 1. Hero Screenshot (REQUIRED)
**File**: `hero-screenshot.png` or `demo.gif`
**Size**: 1280x720px minimum (16:9 ratio)
**Content**: Show the main feature - AI generating a commit message
**Action**:
- Capture the extension in action
- Show the sparkle button, the git diff, and the generated commit message
- Make it visually appealing with good syntax highlighting

---

### 2. Feature Screenshots (HIGHLY RECOMMENDED)

#### Screenshot 1: Model Selection
**File**: `feature-model-picker.png`
**Size**: 800x600px minimum
**Content**: Show the interactive model picker with pricing and details
**Action**: Run `GitMsgAI: Select Model` command and screenshot the picker

---

#### Screenshot 2: Provider Selection
**File**: `feature-provider-selection.png`
**Size**: 800x600px minimum
**Content**: Show the provider selection dropdown
**Action**: Run `GitMsgAI: Select Provider` command and screenshot

---

#### Screenshot 3: Review Mode
**File**: `feature-review-mode.png`
**Size**: 800x600px minimum
**Content**: Show the review dialog with Accept/Edit/Regenerate options
**Action**: Generate a commit with review mode enabled

---

### 3. Demo GIF (HIGHLY RECOMMENDED)
**File**: `demo.gif`
**Size**: Max 10MB, 1280x720px or smaller
**Duration**: 10-20 seconds
**Content**: Show the complete workflow:
1. Make code changes
2. Click sparkle button
3. See AI analyzing
4. Commit message appears
5. Commit applied

**Tools to create**:
- LICEcap (free, cross-platform)
- ScreenToGif (Windows)
- Kap (macOS)

---

## 📊 Where These Appear

- **Hero image**: First thing users see on marketplace page
- **Screenshots**: Gallery carousel below description
- **Demo GIF**: Can replace hero or be in gallery

## 🎯 Best Practices

1. **Use actual UI**: Show real VSCode interface
2. **Dark theme**: Most developers prefer dark theme
3. **Clear text**: Ensure code/text is readable
4. **Show value**: Highlight the AI-generated commit message quality
5. **Keep it simple**: Don't clutter with too many windows

## 📝 After Creating Assets

1. Add images to this folder (`images/marketplace/`)
2. Update README.md to reference them
3. Update package.json if needed
4. Test with `vsce package` to ensure they're included
