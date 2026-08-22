# Panchayat Suvidha Theme Implementation Guide for GI Studio

This guide provides exact specifications to recreate the visual theme from the Panchayat Suvidha project in GI Studio, including CSS variable values, component implementations, and responsive behaviors.

## CSS Variables Definition
Define these in your root stylesheet (`:root` or `body` selector):

```css
:root {
  /* Primary Accent Colors */
  --accent: #2563eb;           /* Vibrant blue for interactive elements */
  --accent-bg: #dbeafe;        /* Light blue background (20% opacity accent) */
  --accent-border: #1d4ed8;    /* Darker blue for hover/focus states */
  
  /* Layout & Dividers */
  --border: #e5e7eb;           /* Light gray for section dividers (gray-200) */
  
  /* Text Colors */
  --text-h: #1f2937;           /* Dark gray for headings and text (gray-800) */
  
  /* Social/Button Elements */
  --social-bg: #f3f4f6;        /* Light gray for social button backgrounds (gray-100) */
  
  /* Interactive Effects */
  --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); /* Subtle elevation */
}
```

*Note: These values follow a modern blue-based palette suitable for government/civic applications. Adjust as needed for brand alignment while maintaining contrast ratios.*

## Component-by-Component Implementation

### 1. Counter Component (`.counter`)
**Purpose**: Interactive badge/count display (likely showing statistics)
**Implementation**:
```css
.counter {
  font-size: 16px;
  padding: 5px 10px;
  border-radius: 5px;
  color: var(--accent);
  background: var(--accent-bg);
  border: 2px solid transparent;
  transition: border-color 0.3s ease;
  margin-bottom: 24px;
  display: inline-block; /* Ensures proper sizing */
}

.counter:hover {
  border-color: var(--accent-border);
}

.counter:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
```
**Usage**: Apply to `<span>` or `<div>` elements displaying numerical data (e.g., village statistics, service counts).

### 2. Hero Section (`.hero`)
**Purpose**: Animated 3D logo display at the top of the page
**HTML Structure**:
```html
<div class="hero">
  <div class="base">[Base Logo/Image]</div>
  <div class="framework">[Framework Logo]</div>
  <div class="vite">[Vite Logo]</div>
</div>
```
**CSS Implementation**:
```css
.hero {
  position: relative;
  height: 200px; /* Adjust based on logo sizes */
  overflow: hidden;
}

.hero .base,
.hero .framework,
.hero .vite {
  position: absolute;
  inset-inline: 0;
  margin: 0 auto;
}

.hero .framework {
  z-index: 1;
  top: 34px;
  height: 28px;
  transform: perspective(2000px) rotateZ(300deg) rotateX(44deg) rotateY(39deg) scale(1.4);
}

.hero .vite {
  z-index: 0;
  top: 107px;
  height: 26px;
  width: auto;
  transform: perspective(2000px) rotateZ(300deg) rotateX(40deg) rotateY(39deg) scale(0.8);
}

/* Base layer typically needs no transform - serves as foundation */
.hero .base {
  z-index: 0;
  top: 0;
  height: auto; /* or specific height */
}
```
**GI Studio Notes**:
- Replace `[Base Logo/Image]`, `[Framework Logo]`, `[Vite Logo]` with actual assets
- If CSS nesting isn't supported, use `.hero .base`, `.hero .framework`, etc.
- Adjust `top` and `height` values based on your actual logo dimensions
- The `perspective(2000px)` creates the 3D depth effect

### 3. Center Layout (`#center`)
**Purpose**: Main content container with vertical centering and spacing
**Implementation**:
```css
#center {
  display: flex;
  flex-direction: column;
  gap: 25px;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - [header_height] - [footer_height]); /* Adjust for layout */
  padding: 0 20px; /* Side padding */
}

@media (max-width: 1024px) {
  #center {
    padding: 32px 20px 24px;
    gap: 18px;
  }
}
```
**Usage**: Wrap your main content sections in a `<div id="center">` element.

### 4. Next Steps Section (`#next-steps`)
**Purpose**: Featured section with icons/social links (typically at bottom)
**HTML Structure**:
```html
<section id="next-steps">
  <div> <!-- Feature Column 1 -->
    <img src="icon1.png" alt="Icon 1" class="icon">
    <h3>Feature Title</h3>
    <p>Description text</p>
  </div>
  <!-- Repeat for additional columns -->
  
  <ul class="social-links">
    <li><a href="#" aria-label="Facebook"><img src="fb-logo.png" alt="Facebook" class="logo"></a></li>
    <li><a href="#" aria-label="Twitter"><img src="tw-logo.png" alt="Twitter" class="logo"></a></li>
    <!-- Add more social links -->
  </ul>
</section>
```
**CSS Implementation**:
```css
#next-steps {
  display: flex;
  border-top: 1px solid var(--border);
  text-align: left;
  padding: 0 20px; /* Match #center side padding */
  gap: 32px; /* Space between columns and social list */
}

#next-steps > div {
  flex: 1 1 0;
  padding: 32px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

#next-steps .icon {
  margin-bottom: 16px;
  width: 22px;
  height: 22px;
}

#next-steps ul {
  list-style: none;
  padding: 0;
  display: flex;
  gap: 8px;
  margin: 32px 0 0;
}

#next-steps ul .logo {
  height: 18px;
}

#next-steps ul a {
  color: var(--text-h);
  font-size: 16px;
  border-radius: 6px;
  background: var(--social-bg);
  display: flex;
  padding: 6px 12px;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  transition: box-shadow 0.3s ease;
}

#next-steps ul a:hover {
  box-shadow: var(--shadow);
}

#next-steps ul a .button-icon {
  height: 18px;
  width: 18px;
}

/* Mobile Adjustments */
@media (max-width: 1024px) {
  #next-steps {
    flex-direction: column;
    text-align: center;
    gap: 24px;
  }
  
  #next-steps > div {
    padding: 24px 20px;
    align-items: center;
  }
  
  #next-steps ul {
    margin-top: 20px;
    flex-wrap: wrap;
    justify-content: center;
  }
  
  #next-steps ul li {
    flex: 1 1 calc(50% - 8px);
    min-width: 120px; /* Prevent too-narrow buttons */
  }
  
  #next-steps ul a {
    width: 100%;
    justify-content: center;
    box-sizing: border-box;
  }
}
```

### 5. Docs Section (`#docs`)
**Purpose**: Vertical divider that becomes horizontal on mobile
**Implementation**:
```css
/* Assume #docs is a sibling to #center and #next-steps in a flex container */
#docs {
  border-right: 1px solid var(--border);
  width: 1px; /* Or flex: 0 0 1px for true divider */
  margin: 0 20px; /* Match side padding */
}

@media (max-width: 1024px) {
  #docs {
    border-right: none;
    border-bottom: 1px solid var(--border);
    height: 1px;
    width: 100%;
    margin: 20px 0;
  }
}
```
**Usage**: Place as a vertical spacer between content sections that should become a horizontal divider on mobile.

### 6. Spacer (`#spacer`)
**Purpose**: Horizontal spacing with visual separator
**Implementation**:
```css
#spacer {
  height: 88px;
  border-top: 1px solid var(--border);
  width: 100%;
}

@media (max-width: 1024px) {
  #spacer {
    height: 48px;
  }
}
```
**Usage**: Place between sections needing vertical space with a subtle divider.

### 7. Ticks Decoration (`.ticks`)
**Purpose**: Decorative triangular markers (often used for section highlights)
**HTML Structure**:
```html
<div class="ticks"></div>
```
**CSS Implementation**:
```css
.ticks {
  position: relative;
  width: 100%;
  height: 0; /* Content comes from pseudo-elements */
  margin: 24px 0; /* Vertical spacing */
}

.ticks::before,
.ticks::after {
  content: '';
  position: absolute;
  top: -4.5px;
  border: 5px solid transparent;
  width: 0;
  height: 0;
}

.ticks::before {
  left: 0;
  border-left-color: var(--border);
}

.ticks::after {
  right: 0;
  border-right-color: var(--border);
}
```
**Usage**: Place as an empty `<div>` where you want decorative tick marks (e.g., above/below headers).

## Responsive Breakpoint
**All media queries use**: `@media (max-width: 1024px)`
- This is the consistent breakpoint for mobile/tablet adjustments
- Ensures uniform behavior across all components
- In GI Studio, maintain this exact value unless your design system specifies otherwise

## Implementation Checklist for GI Studio

1. [ ] Define CSS variables in root stylesheet
2. [ ] Implement `.counter` for statistical displays
3. [ ] Build `.hero` section with 3D logo transform
4. [ ] Create `#center` layout container for main content
5. [ ] Develop `#next-steps` with feature columns and social links
6. [ ] Implement `#docs` as adaptive divider (vertical→horizontal)
7. [ ] Add `#spacer` for vertical spacing with border
8. [ ] Include `.ticks` pseudo-element decoration where needed
9. [ ] Test all responsive behaviors at 1024px breakpoint
10. [ ] Verify focus-visible outlines for accessibility
11. [ ] Check hover transitions (0.3s ease timing)
12. [ ] Validate color contrast ratios meet WCAG AA standards

## Browser Support Notes
- **CSS Nesting**: Used in `.hero` section - if targeting older browsers, convert to:
  ```css
  .hero .base, 
  .hero .framework,
  .hero .vite { /* shared styles */ }
  .hero .framework { /* framework-specific */ }
  .hero .vite { /* vite-specific */ }
  ```
- **Custom Properties**: Supported in all modern browsers (IE11 requires fallback)
- **Focus-visible**: Supported in modern browsers; for broader support, consider:
  ```css
  .counter:focus { /* fallback */ }
  .counter:focus-visible { /* enhanced */ }
  ```
- **Transforms**: The 3D hero effects require transform support (all modern browsers)

## Theme Customization Guidance
To adapt this theme while preserving its structure:
1. **Change the hue**: Modify `--accent` to your brand color (e.g., `#059669` for green, `#dc2626` for red)
2. **Adjust intensity**: Derive `--accent-bg` (20% tint) and `--accent-border` (15% shade) from your base accent
3. **Maintain contrast**: Ensure `--text-h` has sufficient contrast against backgrounds
4. **Preserve semantics**: Keep the functional meanings:
   - `--accent`: Interactive elements
   - `--border`: Dividers/separators
   - `--social-bg`: Secondary backgrounds
   - `--shadow`: Depth/elevation indicators

This implementation will produce a visually identical theme to the original Panchayat Suvidha project, maintaining its professional, government-appropriate aesthetic with subtle interactive enhancements and responsive behavior.