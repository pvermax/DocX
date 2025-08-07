const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const config = require('./docx.config.json');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use('/assets', express.static(path.join(__dirname, 'assets')));

const getDocsTree = (dir, base = '') => {
  const items = fs.readdirSync(dir, { withFileTypes: true });

  const files = [];
  const folders = [];

  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    const relPath = path.join(base, item.name);

    if (item.isDirectory()) {
      folders.push({
        name: item.name,
        type: 'folder',
        children: getDocsTree(fullPath, relPath),
      });
    } else if (item.name.endsWith('.dcx')) {
      const fileName = item.name.replace(/\.dcx$/, '');
      const fileItem = {
        name: fileName,
        type: 'file',
        path: relPath.replace(/\.dcx$/, '').replace(/\\/g, '/'),
      };

      // Root doc gets top priority
      if (fileName === config.docx.root) {
        files.unshift(fileItem); // put at beginning
      } else {
        files.push(fileItem);
      }
    }
  }

  return [...files, ...folders];
};

app.use((req, res, next) => {
  try {
    const docsDir = path.join(__dirname, 'docs');
    res.locals.docsTree = getDocsTree(docsDir);
  } catch (err) {
    res.locals.docsTree = [];
  }
  next();
});

app.use((req, res) => {
  if (req.path === '/') {
    return res.redirect(`/${config.docx.root}`);
  }

  const reqPath = decodeURIComponent(req.path.slice(1));
  const safePath = path.normalize(reqPath).replace(/^(\.\.[\/\\])+/, '');
  const filePath = path.join(__dirname, 'docs', `${safePath}.dcx`);

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(404).render('error/404', {
        docx: config.docx,
        docsTree: res.locals.docsTree
      });
    }

    res.render('docx', {
      path: req.path,
      docx: config.docx,
      doc: data,
      docsTree: res.locals.docsTree
    });
  });
});

app.listen(config.web.port || 3000, () => {
  console.log(`Server running on http://localhost:${config.web.port || 3000}`);
});
