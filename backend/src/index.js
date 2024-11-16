// backend/src/index.js
import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';

const app = express();
const port = 3000;

const CONFIG_DIR = '/config';
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');
const JOURNAL_DIR = '/journal';

app.use(cors());
app.use(express.json());

// Add root route
app.get('/', (req, res) => {
  res.json({ message: 'Eradia Journal API is running' });
});

function getJournalPath(date) {
 const year = date.getFullYear();
 const month = (date.getMonth() + 1).toString().padStart(2, '0');
 return path.join(JOURNAL_DIR, year.toString(), month);
}

async function getNextFileNumber(dirPath) {
 try {
   const files = await fs.readdir(dirPath);
   const existingNumbers = files
     .filter(f => f.endsWith('.json'))
     .map(f => parseInt(f.split('-')[1]))
     .filter(n => !isNaN(n));
   
   const maxNumber = Math.max(0, ...existingNumbers);
   return (maxNumber + 1).toString().padStart(3, '0');
 } catch {
   return '001';
 }
}

async function ensureDir(dirPath) {
 try {
   await fs.access(dirPath);
 } catch {
   await fs.mkdir(dirPath, { recursive: true });
 }
}

async function ensureConfig() {
 await ensureDir(CONFIG_DIR);
 try {
   await fs.access(CONFIG_FILE);
 } catch {
   await fs.writeFile(CONFIG_FILE, JSON.stringify({ openWindows: {} }, null, 2));
 }
}

app.get('/api/config', async (req, res) => {
 try {
   await ensureConfig();
   const content = await fs.readFile(CONFIG_FILE, 'utf-8');
   res.json(JSON.parse(content));
 } catch (error) {
   console.error('Error loading config:', error);
   res.json({ openWindows: {} }); // Return default instead of error
 }
});

app.post('/api/config', async (req, res) => {
 try {
   await ensureConfig();
   const config = req.body;
   await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2));
   res.json(config);
 } catch (error) {
   console.error('Error saving config:', error);
   res.status(500).json({ error: error.message });
 }
});

app.get('/api/entries', async (req, res) => {
 try {
   const entries = [];
   
   // Recursively walk through the journal directory
   async function walkDir(dir) {
     try {
       const files = await fs.readdir(dir);
       
       for (const file of files) {
         const filePath = path.join(dir, file);
         const stat = await fs.stat(filePath);
         
         if (stat.isDirectory()) {
           await walkDir(filePath);
         } else if (file.endsWith('.json')) {
           // Read the metadata file
           const content = await fs.readFile(filePath, 'utf-8');
           const metadata = JSON.parse(content);
           
           // Read the corresponding .md file
           const mdPath = filePath.replace('.json', '.md');
           let mdContent = '';
           try {
             mdContent = await fs.readFile(mdPath, 'utf-8');
           } catch (e) {
             console.warn(`No .md file found for ${file}`);
           }
           
           entries.push([
             metadata.id,
             {
               ...metadata,
               content: mdContent
             }
           ]);
         }
       }
     } catch (error) {
       console.error(`Error walking directory ${dir}:`, error);
     }
   }
   
   await walkDir(JOURNAL_DIR);
   res.json(entries);
 } catch (error) {
   console.error('Error loading all entries:', error);
   res.status(500).json({ error: error.message });
 }
});

app.get('/api/entries/:date', async (req, res) => {
 try {
   const date = new Date(req.params.date);
   const dirPath = getJournalPath(date);
   const day = date.getDate().toString().padStart(2, '0');
   
   await ensureDir(dirPath);
   
   const files = await fs.readdir(dirPath);
   const dayFiles = files.filter(f => f.startsWith(`${day}-`));
   
   const entries = [];
   for (const file of dayFiles) {
     if (!file.endsWith('.json')) continue;

     const metadataPath = path.join(dirPath, file);
     const mdPath = metadataPath.replace('.json', '.md');
     
     try {
       const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf-8'));
       let content = '';
       try {
         content = await fs.readFile(mdPath, 'utf-8');
       } catch (e) {
         console.warn(`No .md file found for ${file}`);
       }
       
       entries.push([
         metadata.id,
         {
           ...metadata,
           content
         }
       ]);
     } catch (error) {
       console.error(`Error reading files for ${file}:`, error);
     }
   }
   
   res.json(entries);
 } catch (error) {
   console.error('Error loading entries:', error);
   res.status(500).json({ error: error.message });
 }
});

app.post('/api/entries', async (req, res) => {
  try {
    const { id, entry } = req.body;
    console.log('Received entry:', { id, entryContent: entry.content, entryLength: entry.content ? entry.content.length : 0 });

    const date = new Date(entry.created);
    const dirPath = getJournalPath(date);
    const day = date.getDate().toString().padStart(2, '0');

    await ensureDir(dirPath);

    const files = await fs.readdir(dirPath);
    let existingFile = null;
    for (const file of files) {
      if (file.endsWith('.json')) {
        const metadataPath = path.join(dirPath, file);
        try {
          const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf-8'));
          if (metadata.id === id) {
            existingFile = file.replace('.json', '');
            break;
          }
        } catch (e) {
          console.warn(`Error reading metadata for ${file}:`, e);
        }
      }
    }

    const filename = existingFile || `${day}-${await getNextFileNumber(dirPath)}`;
    const mdFilePath = path.join(dirPath, `${filename}.md`);
    const metadataPath = path.join(dirPath, `${filename}.json`);

    console.log('Writing content to .md file:', { mdFilePath, contentLength: entry.content.length });
    await fs.writeFile(mdFilePath, entry.content);

    // Confirm write by reading the content back
    const verifyContent = await fs.readFile(mdFilePath, 'utf-8');
    console.log('Verified written content:', { mdFilePath, contentLength: verifyContent.length });

    const metadata = {
      id,
      title: entry.title,
      created: entry.created,
      modified: new Date().toISOString(),
      tags: entry.tags || [],
      filename
    };
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));

    res.json({ ...entry, content: entry.content, filename });
  } catch (error) {
    console.error('Error saving entry:', error);
    res.status(500).json({ error: error.message });
  }
});

// Helper function for retries
async function writeFileWithRetry(filePath, content, retries = 3) {
  for (let attempt = 0; attempt < retries; attempt++) {
    await fs.writeFile(filePath, content);
    try {
      const verifyContent = await fs.readFile(filePath, 'utf-8');
      if (verifyContent === content) return; // Exit if successful
    } catch (e) {
      console.error('Error verifying content write:', e);
    }
    await new Promise(res => setTimeout(res, 100)); // Wait before retry
  }
  throw new Error('Failed to write content after multiple attempts');
}


app.delete('/api/entries/:id', async (req, res) => {
 try {
   const { entry } = req.body;
   const date = new Date(entry.created);
   const dirPath = getJournalPath(date);
   
   const filePath = path.join(dirPath, `${entry.filename}.md`);
   const metadataPath = path.join(dirPath, `${entry.filename}.json`);
   
   await Promise.all([
     fs.unlink(filePath).catch(() => {}),
     fs.unlink(metadataPath).catch(() => {})
   ]);
   
   res.json({ success: true });
 } catch (error) {
   console.error('Error deleting entry:', error);
   res.status(500).json({ error: error.message });
 }
});

app.listen(port, '0.0.0.0', () => {
 console.log(`Server running at http://0.0.0.0:${port}`);
});