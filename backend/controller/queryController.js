const duckdb = require('duckdb');
const path = require('path');
const axios = require('axios');
const fs = require('fs');
const { OpenAI } = require('openai');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

const db = new duckdb.Database(':memory:', (err) => {
  if (err) {
    console.error('Error connecting to DuckDB:', err.message);
  } else {
    console.log('Connected to DuckDB (in-memory).');
  }
});

let tableName = '';
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadFile = async (req, res) => {
  try {
    const file = req.files.file;
    const fileName = `${path.basename(file.name, path.extname(file.name))}.csv`;

    const cloudinaryResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: 'raw', public_id: fileName, format: 'csv' },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      uploadStream.end(file.data);
    });

    const cloudinaryUrl = cloudinaryResult.secure_url;
    const tmpFilePath = `/tmp/${path.basename(cloudinaryUrl)}`;

    axios
      .get(cloudinaryUrl, { responseType: 'arraybuffer' })
      .then((response) => {
        fs.writeFileSync(tmpFilePath, response.data);

        const query = `CREATE TABLE test AS SELECT * FROM read_csv_auto('${tmpFilePath}');`;
        db.run(query, (err) => {
          if (err) {
            console.error('Error loading CSV from local file:', err.message);
            res.status(500).json({ error: `DuckDB Error: ${err.message}` });
          } else {
            console.log('CSV loaded successfully from local file.');
            res.status(200).json({ message: 'Table created successfully.' });
          }
        });
      })
      .catch((error) => {
        console.error('Error downloading CSV:', error.message);
        res
          .status(500)
          .json({ error: 'Failed to download CSV for local processing.' });
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to upload CSV and create table' });
  }
};
const getData = async (req, res) => {
  const { sql } = req.body;
  if (!tableName) {
    return res.status(400).json({ error: 'No CSV file uploaded.' });
  }
  try {
    db.all(`SELECT * FROM countries ${tableName}`, (err, rows) => {
      if (err) {
        console.log('SQL Error:', err.message);
        return res.status(400).json({ error: 'Invalid SQL query' });
      }
      res.status(200).json({ result: rows });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error executing SQL query' });
  }
};
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const generateSQL = async (req, res) => {
  if (!tableName) {
    return res.status(400).json({ error: 'No CSV file uploaded.' });
  }

  const { query, schema } = req.body;

  const schemaDescription = schema
    .map((col) => `${col.name} (${col.type})`)
    .join(', ');

  const prompt = `
        Here is the database schema:
        Table: ${tableName}
        Columns: ${schemaDescription}
      
        Convert the following text into an SQL query:
        "${query}"
        
        Also if there is an aggregation function create an alias of that column wisely
        `;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an system that just only outputs SQL queries in one line with no explanation.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 150,
    });

    const ans = response.choices[0].message.content.trim();
    const regex = /(?<=```sql\s)(.*?)(?=\s```$)/;
    const sql = ans.match(regex)[0];

    res.json({ sql });
  } catch (error) {
    console.error('Error generating SQL:', error);
    res.status(500).json({ error: 'Error generating SQL' });
  }
};

const executeQuery = async (req, res) => {
  const { sql } = req.body;
  if (!tableName) {
    return res.status(400).json({ error: 'No CSV file uploaded.' });
  }
  try {
    const sanitizedSQL = sql.trim();
    console.log('Sanitized SQL Query:', sanitizedSQL);

    db.all(sanitizedSQL, (err, rows) => {
      if (err) {
        console.log('SQL Error:', err.message);
        return res.status(400).json({ error: 'Invalid SQL query' });
      }
      console.log(rows);
      res.status(200).json({ result: rows });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error executing SQL query' });
  }
};
module.exports = { uploadFile, generateSQL, executeQuery, getData };
