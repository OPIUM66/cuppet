import express from 'express';
import bodyParser from 'body-parser';
import { ai_function } from './ai.js';  
import cors from 'cors';
import ParsCodersScrapper from '../cuppet/Parscoders.js';

// ! TODO: CLEAN THIS MESS UP

const app = express();
const port = 3001;

app.use(bodyParser.json());
app.use(cors());  

const p = new ParsCodersScrapper();
await p.init();

app.get('/', (req, res) => {
  console.log('NEW REQUEST');

  res.json({ response: 'hi' });
})

app.get('/scrapper', async (req, res) => {
  console.log('NEW SCRAP');
  const projects = await p.extractProjects();

  res.json({ response: projects });
})
 
app.post('/bid', async (req, res) => {
  try {
    const { id, meta } = req.body;
    console.log('NEW BID', { id, meta });
    const bid = await p.sendBid(id, meta);
    res.json({ response: bid });

  } catch (error) {
    console.log('SEND BID FAILED', error);
    res.json({ response: false });

  }
})

app.post('/chat', async (req, res) => {

  const { userMessage, pre, post } = req.body;
  console.log('NEW CHAT', {
    userMessage, pre, post
  });

  if (!userMessage) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const response = await ai_function(
      userMessage.toString() || "",
      pre || "",
      post || ""
    );

    res.json({ response });
  } catch (error) {
    console.error('Error during chat:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
