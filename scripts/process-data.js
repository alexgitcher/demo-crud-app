import pug from 'pug';
import fs from 'fs';
import { mkdir, readdir, stat, writeFile, readFile, unlink } from 'node:fs/promises';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATA_DIR_PATH = path.resolve(__dirname, '..', 'data');

if (!fs.existsSync(DATA_DIR_PATH)) {
  try {
    await mkdir(DATA_DIR_PATH);
  } catch (error) {
    console.error(error);
  }
}

const getData = async () => {
  let files = [];

  // Находим все файлы в директории DATA_DIR_PATH
  try {
    const possibleFiles = await readdir(DATA_DIR_PATH);

    for (const possibleFile of possibleFiles) {
      const filePath = path.join(DATA_DIR_PATH, possibleFile);
      const fileStat = await stat(filePath);
      const isDirectory = fileStat.isDirectory();

      if (!isDirectory) {
        files.push(filePath);
      }
    }
  } catch (error) {
    console.error(`Ошибка при чтении директории ${DATA_DIR_PATH}`, error);
  }

  const data = await Promise.all(files.map(async (filePath, index) => {
    try {
      const content = await readFile(filePath, { encoding: 'utf8' });

      // Добавляем id для вывода на клиенте, чтобы было удобно переходить к конкретной статье по якорной ссылке
      const updatedContent = {
        id: index + 1,
        ...JSON.parse(content),
      };

      return updatedContent;

    } catch (error) {
      console.error(`Ошибка при чтении файла ${filePath}`, error)
    }
  }));

  return data;
};

const processedFormData = (data) => {
  // Преобразуем ингредиенты из строки в массив строк и удаляем лишние пробелы
  const newIngredients = data.ingredients.split(',').map(ingredient => ingredient.trim());

  return {
    ...data,
    ingredients: newIngredients,
  };
};

const saveNewData = async (data) => {
  const processedData = processedFormData(data);

  // Добавляем поле createdAt в полученные данные
  const newData = {
    createdAt: new Date(),
    ...processedData,
  };

  const newFilePath = path.join(DATA_DIR_PATH, `${newData.createdAt.toJSON()}.json`);

  // Записываем преобразованные в JSON данные в файл на ФС
  try {
    await writeFile(newFilePath, JSON.stringify(newData));
  } catch (error) {
    console.error(`Ошибка при записи файла ${newFilePath}`, error);
  }

  return newData;
};

const getItem = async (id) => {
  const items = await getData();

  return items.find(item => item.id === Number(id));
};

const deleteItem = async (id) => {
  const item = await getItem(id);
  const itemPath = path.join(DATA_DIR_PATH, `${item.createdAt}.json`);

  try {
    await unlink(itemPath);
  } catch (error) {
    console.error(`Ошибка при удалении файла ${itemPath}.json`, error);
  }
};

const saveEditedData = async (data) => {
  const processedData = processedFormData(data);

  try {
    const editedFilePath = path.join(DATA_DIR_PATH, `${data.createdAt}.json`);

    const editedData = {
      lastEditedAt: new Date(),
      ...processedData,
    };

    await writeFile(editedFilePath, JSON.stringify(editedData));

    return editedData;
  } catch (error) {
    console.error(`Ошибка при записи файла ${newFilePath} после редактирования`, error);
  }
};

const renderIndexHtmlFile = async () => {
  const data = await getData();
  const html = pug.renderFile(path.resolve(__dirname, '..', 'views', 'index.pug'), { items: { ...data }, cache: true });

  await writeFile(path.join(__dirname, '..', 'build', 'index.html'), html);
};

export {
  saveNewData,
  getData,
  getItem,
  saveEditedData,
  deleteItem,
  renderIndexHtmlFile,
};
