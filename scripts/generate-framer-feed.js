const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const blogDir = './blog';
const outputFile = './framer-feed.json';

// Cutoff date: only include articles on or after this date
// This prevents syncing existing articles that are already in Framer CMS
const CUTOFF_DATE = new Date('2026-02-01');

// Files to skip
const SKIP_FILES = ['index.md'];

// Extract short title: text before first ':' or ' - '
function extractShortTitle(title) {
  if (!title) return '';
  const colonIndex = title.indexOf(':');
  const dashIndex = title.indexOf(' - ');

  let cutIndex = -1;
  if (colonIndex > 0 && dashIndex > 0) {
    cutIndex = Math.min(colonIndex, dashIndex);
  } else if (colonIndex > 0) {
    cutIndex = colonIndex;
  } else if (dashIndex > 0) {
    cutIndex = dashIndex;
  }

  return cutIndex > 0 ? title.substring(0, cutIndex).trim() : title;
}

const articles = [];

// Read all markdown files (excluding skipped files)
const files = fs.readdirSync(blogDir)
  .filter(f => f.endsWith('.md') && !SKIP_FILES.includes(f));

for (const file of files) {
  const filePath = path.join(blogDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  const { data: frontmatter, content: body } = matter(content);

  // Skip articles before cutoff date
  const articleDate = frontmatter.date ? new Date(frontmatter.date) : new Date();
  if (articleDate < CUTOFF_DATE) {
    continue;
  }

  const slug = file.replace('.md', '');
  const title = frontmatter.title || '';

  articles.push({
    id: slug,
    title: title,
    slug: slug,
    shortTitle: extractShortTitle(title),
    content: body.trim(),
    tags: frontmatter.tags || [],
    categories: frontmatter.tags || [],
    date: frontmatter.date || new Date().toISOString(),
    image: '',       // Fill in Framer
    author: '',      // Fill in Framer
    jobPosition: ''  // Fill in Framer
  });
}

// Sort by date descending
articles.sort((a, b) => new Date(b.date) - new Date(a.date));

fs.writeFileSync(outputFile, JSON.stringify({ articles }, null, 2));
console.log(`Generated ${outputFile} with ${articles.length} articles (cutoff: ${CUTOFF_DATE.toISOString().split('T')[0]})`);