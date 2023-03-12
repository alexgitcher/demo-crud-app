import express from 'express';
import config from 'config';

import { fileURLToPath } from 'url';
import path, { dirname } from 'path';

import {
  saveNewData,
  getItem,
  saveEditedData,
  deleteItem,
  renderIndexHtmlFile,
} from './scripts/process-data.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.use(express.json({ extended: true }));
app.use(express.static('build'));

app.set('views', './views');
app.set('view engine', 'pug');

const PORT = config.get('port') || 4000;

app.get('/', async (request, response) => {
  await renderIndexHtmlFile();
  response.sendFile(path.resolve(__dirname, 'build', 'index.html'));
});

app.get('/success', (request, response) => {
  response.sendFile(path.resolve(__dirname, 'build', 'success.html'));
});

app.get('/add', (request, response) => {
  response.sendFile(path.resolve(__dirname, 'build', 'add.html'));
});

app.post('/add', async (request, response) => {
  try {
    const savedData = await saveNewData(request.body);
    await renderIndexHtmlFile();
    response.json(savedData);
  } catch (error) {
    console.error('Ошибка сохранения данных');
    response.status(500);
  }
});

app.get('/edit/:id', async (request, response) => {
  const { id } = request.params;

  const item = await getItem(id);

  response.render('edit', { item });
});

app.post('/edit', async (request, response) => {
  try {
    const savedData = await saveEditedData(request.body);
    await renderIndexHtmlFile();
    response.json(savedData);
  } catch (error) {
    console.error('Ошибка сохранения данных при редактировании');
    response.status(500);
  }
});

app.delete('/', async (request, response) => {
  const { id } = request.body;

  try {
    await deleteItem(id);
    await renderIndexHtmlFile();
    response.status(204).end();
  } catch (error) {
    console.error(`Ошибка при удалении: ${error}`);
    response.status(500);
  }
});

function start() {
  try {
    app.listen(PORT, () => console.log(`Приложение запущено на порту ${PORT}`));
  } catch (error) {
    console.error(`Ошибка сервера: ${error.message}`);
    process.exit(1);
  }
}

start();
