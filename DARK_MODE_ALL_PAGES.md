# Dark Mode for All Pages - Implementation Guide

## Summary

Your application has **23 Vue pages** that need dark mode support. I've already updated:
- ✅ Layout (default.vue)
- ✅ Notifications page
- ✅ NotificationDropdown component
- ✅ ThemeToggle component

## Pages Requiring Dark Mode Updates

### Priority 1: Core Pages (Most Used)
1. ✅ `/` - Dashboard (index.vue) - **Manual update required** (charts need theme-aware colors)
2. `/tickets` - Tickets list (index.vue)
3. `/tickets/[id]` - Ticket detail ([id].vue)
4. `/tickets/assigned` - **Already updated** ✅
5. `/login` - Login page
6. `/register` - Register page

### Priority 2: User Pages
7. `/profile` - User profile
8. `/forgot-password`
9. `/reset-password`

### Priority 3: Admin Pages
10. `/admin/index.vue` - Admin dashboard
11. `/admin/mobile-report.vue`
12. `/admin/gold-rate.vue`
13. `/admin/gold-report.vue`
14. `/admin/lbb-trading-view.vue`
15. `/admin/lbbplus_download.vue`

### Priority 4: Special Features
16. `/corebank/check_info.vue`
17. `/events/event_report.vue`
18. `/events/register.vue`
19. `/teller/check-eod.vue`
20. `/teller/create-eod-session.vue`
21. `/teller/eod-monitor.vue`
22. `/teller/update-checklist/[id].vue`

## Automated Update Method

### Option 1: Using VS Code Find & Replace (Recommended)

1. Open VS Code
2. Press `Cmd/Ctrl + Shift + H` (Find in Files)
3. Enable **Regex mode** (icon: `.*`)
4. Use **Replace All** for each pattern below

### Patterns to Apply

#### Pattern 1: Main Background
```
Find: class="(.*?)bg-gray-50(.*?)"
Replace: class="$1bg-gray-50 dark:bg-gray-900$2"
```

#### Pattern 2: Card/White Backgrounds
```
Find: class="(.*?)bg-white([^"]*?)"
Replace: class="$1bg-white dark:bg-gray-800$2"
```

#### Pattern 3: Primary Text
```
Find: class="(.*?)text-gray-900([^"]*?)"
Replace: class="$1text-gray-900 dark:text-gray-100$2"
```

#### Pattern 4: Secondary Text
```
Find: class="(.*?)text-gray-600([^"]*?)"
Replace: class="$1text-gray-600 dark:text-gray-300$2"
```

#### Pattern 5: Borders
```
Find: class="(.*?)border-gray-200([^"]*?)"
Replace: class="$1border-gray-200 dark:border-gray-700$2"
```

### Important Notes:
- Run patterns **one at a time**
- Review changes before saving
- Test each page after updates
- Some pages may need manual tweaks

## Manual Update Requirements

### Pages with Special Considerations

#### 1. Dashboard (index.vue)
**Requires manual update for:**
- Chart.js legend colors (lines 386, 454)
- Chart.js tooltip backgrounds (lines 390, 457, 522)
- Chart.js grid colors (lines 554)
- Dynamic status/priority colors

**Chart Updates Needed:**
```javascript
// Update legend label colors
labels: {
  color: 'rgb(100, 116, 139)' // slate-500
  // Should become theme-aware
}

// Update tooltip backgrounds
backgroundColor: 'rgba(17, 24, 39, 0.8)'
// Should check theme and adjust

// Grid colors
grid: {
  color: 'rgba(226, 232, 240, 0.6)'
  // Should become theme-aware
}
```

#### 2. Login/Register Pages
**Check for:**
- Form input backgrounds
- Button hover states
- Link colors
- Error message styling

#### 3. Tickets Detail Page
**Check for:**
- Comment sections
- Attachment lists
- History/activity feed
- Status badges

#### 4. Admin Pages
**Check for:**
- Data tables
- Charts/graphs
- Filter dropdowns
- Export buttons

## Step-by-Step Process

### Step 1: Backup
```bash
git add .
git commit -m "Backup before dark mode updates"
```

### Step 2: Update Core Pages First

**Tickets List (/tickets/index.vue):**
- Table headers and rows
- Search inputs
- Filter dropdowns
- Pagination

**Tickets Detail (/tickets/[id].vue):**
- Ticket header section
- Comment cards
- Attachment list
- Action buttons

**Login/Register:**
- Form containers
- Input fields
- Submit buttons
- Links

### Step 3: Test Each Page

After updating each page, test:
1. Toggle theme using sun/moon button
2. Check all interactive elements
3. Verify text readability
4. Check hover states
5. Verify form inputs work

### Step 4: Update Admin Pages

Apply same patterns to admin pages.
Note: Admin pages may have additional charts/graphs that need special handling.

### Step 5: Update Special Feature Pages

EOD, Events, Corebank pages.
These may have custom layouts requiring manual review.

## Common Dark Mode Classes Reference

### Backgrounds
```
Light Mode        → Dark Mode Equivalent
bg-white          → dark:bg-gray-800
bg-gray-50        → dark:bg-gray-900
bg-gray-100       → dark:bg-gray-700
bg-gray-200       → dark:bg-gray-600
```

### Text
```
text-gray-900     → dark:text-gray-100
text-gray-700     → dark:text-gray-200
text-gray-600     → dark:text-gray-300
text-gray-500     → dark:text-gray-400
```

### Borders
```
border-gray-100   → dark:border-gray-700
border-gray-200   → dark:border-gray-700
border-gray-300   → dark:border-gray-600
```

### Buttons (Amber/Gold Theme)
```
bg-amber-600 hover:bg-amber-700
→
bg-amber-600 dark:bg-amber-500 hover:bg-amber-700 dark:hover:bg-amber-600
```

### Input Fields
```
bg-white border-gray-300
→
bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600
text-gray-900 dark:text-gray-100
```

### Cards/Containers
```
bg-white shadow-lg border border-gray-200
→
bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700
```

### Hover States
```
hover:bg-gray-50
→
hover:bg-gray-50 dark:hover:bg-gray-700
```

## Testing Checklist

### For Each Page:

- [ ] Page loads without errors
- [ ] Background colors correct in both themes
- [ ] Text is readable in both themes
- [ ] Borders visible in both themes
- [ ] Forms work correctly
- [ ] Buttons show hover states
- [ ] Links are clickable and visible
- [ ] Icons have proper colors
- [ ] Dropdowns/modals styled correctly
- [ ] No FOUC (flash of unstyled content)

### Specific Elements to Check:

#### Forms
- [ ] Input backgrounds
- [ ] Input text color
- [ ] Placeholder text visible
- [ ] Focus rings visible
- [ ] Error messages readable

#### Tables
- [ ] Header background
- [ ] Row backgrounds
- [ ] Row hover states
- [ ] Cell borders
- [ ] Text contrast

#### Cards
- [ ] Card backgrounds
- [ ] Card borders
- [ ] Shadow visibility
- [ ] Header sections
- [ ] Footer sections

#### Modals/Dropdowns
- [ ] Overlay/backdrop
- [ ] Modal background
- [ ] Close buttons
- [ ] Content readability

## Quick Fix for Common Issues

### Issue: Text not visible in dark mode
**Solution:**
```vue
<!-- Add explicit text color -->
<p class="text-gray-900 dark:text-gray-100">
```

### Issue: Border not visible in dark mode
**Solution:**
```vue
<!-- Add dark border -->
<div class="border border-gray-200 dark:border-gray-700">
```

### Issue: Button hard to see in dark mode
**Solution:**
```vue
<!-- Lighten button in dark mode -->
<button class="bg-amber-600 dark:bg-amber-500">
```

### Issue: Input field looks disabled
**Solution:**
```vue
<!-- Add dark background and text -->
<input class="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
```

## Advanced: Theme-Aware Charts

For pages with Chart.js (like dashboard):

```javascript
import { useThemeStore } from '~/stores/theme';

const themeStore = useThemeStore();

// Get colors based on theme
const getChartColors = () => {
  return {
    text: themeStore.isDark ? '#E5E7EB' : '#334155',
    grid: themeStore.isDark ? 'rgba(75, 85, 99, 0.3)' : 'rgba(226, 232, 240, 0.6)',
    tooltip: themeStore.isDark ? 'rgba(31, 41, 55, 0.9)' : 'rgba(17, 24, 39, 0.8)',
  };
};

// Use in chart options
options: {
  plugins: {
    legend: {
      labels: {
        color: getChartColors().text
      }
    }
  },
  scales: {
    x: {
      grid: {
        color: getChartColors().grid
      }
    }
  }
}

// Watch for theme changes and update charts
watch(() => themeStore.isDark, () => {
  updateCharts();
});
```

## Performance Tips

1. **Use Transitions**: Add `transition-colors duration-200` for smooth theme switching
2. **Avoid Over-nesting**: Keep dark: classes at the same level as base classes
3. **Group Similar Elements**: Apply dark mode classes to parent containers when possible
4. **Test Mobile**: Verify theme works on mobile screens

## Final Steps

1. **Update README.md**: Document that all pages support dark mode
2. **Test Thoroughly**: Check every page in both themes
3. **Get Feedback**: Ask users to report any visibility issues
4. **Monitor**: Check browser console for any CSS errors
5. **Optimize**: Remove any unused CSS classes

## Quick Command Reference

### Find pages without dark mode:
```bash
cd frontend/pages
grep -r "bg-white" *.vue | grep -v "dark:" | wc -l
```

### Find pages with dark mode:
```bash
grep -r "dark:bg-" *.vue | cut -d: -f1 | sort -u
```

### Count total pages:
```bash
find . -name "*.vue" -type f | wc -l
```

## Next Steps

1. Start with Priority 1 pages (most used)
2. Use find & replace for bulk updates
3. Manually review each updated page
4. Test in both themes
5. Move to Priority 2, 3, 4

## Need Help?

Common issues and solutions are in `DARK_MODE_THEME.md`.

For complex pages (like dashboard with charts), you may want to:
1. Create a separate branch
2. Update one section at a time
3. Test thoroughly
4. Merge when complete

Good luck! The bulk of the work can be done with find & replace. 🚀
