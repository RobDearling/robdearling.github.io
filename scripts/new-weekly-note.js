const fs = require('fs');
const path = require('path');

// Get the date for this week (Monday of current week)
function getMondayOfCurrentWeek() {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const monday = new Date(today.setDate(diff));
  return monday;
}

// Format date as YYYY-MM-DD
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Format date for display (DD/MM/YYYY)
function formatDisplayDate(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

// Create new weekly note
function createWeeklyNote() {
  const monday = getMondayOfCurrentWeek();
  const dateString = formatDate(monday);
  const displayDate = formatDisplayDate(monday);

  const fileName = `Week-${dateString}.md`;
  const filePath = path.join(process.cwd(), 'weekly-notes', fileName);

  // Check if file already exists
  if (fs.existsSync(filePath)) {
    console.log(`Weekly note for ${dateString} already exists at: ${filePath}`);
    console.log('Opening existing file...');
    return filePath;
  }

  const template = `---
title: 'Week notes ${displayDate}'
date: '${dateString}'
---

## What happened this week

[Write about what happened this week...]

## Interesting links

- [Link title](https://example.com)

## Interesting projects

- [Project name](https://github.com/example/project) - Brief description
`;

  fs.writeFileSync(filePath, template, 'utf8');
  console.log(`Created new weekly note: ${filePath}`);
  return filePath;
}

// Run the script
try {
  const filePath = createWeeklyNote();
  console.log('\nYou can now edit your weekly note!');
} catch (error) {
  console.error('Error creating weekly note:', error);
  process.exit(1);
}
