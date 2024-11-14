import React, { useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import toast, { Toaster } from 'react-hot-toast'

import { faArrowLeft, faCancel, faGear, faMagicWandSparkles, faMessage } from '@fortawesome/free-solid-svg-icons'

import './App.css';

// ! TODO: CLEAN THIS MESS UP

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [scraping, setScraping] = useState(false);
  const [activeProject, setActiveProject] = useState(null);

  const handleSendProjectDetail = async (project) => {
    toast('درحال بررسی بیشتر جزئیات پروژه', {
      icon: '🔍',
    });
    const projectPrompt = `
    عنوان پروژه: ${project.title}
    توضیحات پروژه: ${project.description}
    بودجه پروژه: ${project.budget}
    مهارت های مورد نیاز: ${project.skills.toString()}
    ` ;
    const prompt = `
    ${projectPrompt}
  لطفاً با استفاده از اطلاعات بالا، دو متن زیر را به فارسی ایجاد کنید:

  1. "bidMessage": یک پیام پیشنهادی کوتاه و رسمی برای ارسال به کارفرما که مختصر، دوستانه و حرفه‌ای باشد.
  2. "scan": یک تحلیل کامل از پروژه شامل نحوه انجام بهینه کار، نکات کلیدی برای موفقیت و ابزارهای پیشنهادی برای اجرای با کیفیت.

  دقت کنید که پیام پیشنهادی (bidMessage) باید بسیار کوتاه و دقیق باشد، و تحلیل (scan) باید جامع و کاربردی باشد تا به فریلنسر در انجام بهتر پروژه کمک کند.
    `
    console.log('Checking', prompt);
    await handleSendMessage(prompt)
  };
  const handleSendMessage = async (prompt, pre = '', post = '') => {
    toast('درحال ارسال پیغام', {
      icon: '🗯',
    });
    let tempInput = prompt || input;

    setLoading(true);
    setInput('');
    setMessages((prevMessages) => [...prevMessages, `${tempInput}`]);

    let theResponse;

    try {
      const result = await axios.post('http://localhost:3001/chat', {
        userMessage: tempInput,
        pre,
        post
      });
      theResponse = result.data.response;
    } catch (error) {
      console.error('Error fetching response:', error);
      theResponse = 'خطایی به وجود آمد؛ لطفا دوباره امتحان کنید';
    }

    setLoading(false);
    setMessages((prevMessages) => [...prevMessages, theResponse]);
  };
  const handleScrapeProjects = async () => {
    toast('درحال استخراج پروژه ها', {
      icon: '🌟',
    });
    setLoading(true);
    setScraping(true);
    try {
      const result = await axios.get('http://localhost:3001/scrapper'); 

      setProjects(result.data.response);
    } catch (error) {
      console.error('Error scraping projects:', error);
    }
    setScraping(false);
    setLoading(false);

  };
  const handleBid = async (projectId, project) => {
    setLoading(true);

    console.log('Sending bid for project:', projectId, project);
    let meta = {}
    let bidMessage = document.getElementById('bid_message').value;
    if (bidMessage && bidMessage !== '') {
      meta.message = bidMessage
    }

    let bidBudget = document.getElementById('bid_budget').value;
    if (bidBudget && bidBudget !== '') {
      meta.bidAmount = bidBudget
    }

    let bidDeadline = document.getElementById('bid_deadline').value;
    if (bidDeadline && bidDeadline !== '') {
      meta.deadline = bidDeadline
    }


    const result = await axios.post('http://localhost:3001/bid', {
      id: projectId,
      meta
    });
    setLoading(false);

    switch (result.data.response.message) {
      case "SENT":
        toast.success('با موفقیت درخواست شما ارسال شد')
        break;
      case "SENT_BEFORE":
        toast.success('قبلا به این پروژه درخواست ارسال کردید')
        break;
      case "ERROR":
        toast.error("ارسال نشد")
        break;
      case "ERROR_COOKIES":
        toast('خطای ورود به سیستم', {
          icon: '🍪',
        });
        break;
      default:
        break;
    }
    console.log('THE RESULT OF BID :', result);

  };
  const handleActiveProject = (project) => {
    setActiveProject(project);
    console.log('Active project:', project);
  };


  return (
    <div className="App">
      <div><Toaster /></div>
      {loading ? <div className='overlay'><h2>
        <section className="dots-container">
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
        </section>
      </h2></div> : <></>}
      {activeProject ? (
        <div className="bid-form">
          <h4>
            ارسال پیشنهاد به پروژه ({activeProject.projectID})  <span>{activeProject.title}</span>
            <p>{activeProject.budget}</p>
            <p>{activeProject.description}</p>

          </h4>
          <textarea id='bid_message' rows={20} placeholder="توضیحات پیشنهاد"></textarea>
          <input id='bid_budget' type="number" placeholder="قیمت پیشنهادی" />
          <input id='bid_deadline' type="number" placeholder="موعد تحویل" />
          <button onClick={() => handleBid(activeProject.projectID, activeProject)}>
            ارسال پیشنهاد
            <FontAwesomeIcon icon={faArrowLeft} />

          </button>
          <button
            onClick={() => handleSendProjectDetail(activeProject)} 
            className="send-bid-button"
          >
            بررسی بیشتر
            <FontAwesomeIcon icon={faMagicWandSparkles} />

          </button>
          <button className='cancel' onClick={() => setActiveProject(null)}>
            انصراف
            <FontAwesomeIcon icon={faCancel} />

          </button>
        </div>
      ) : <></>}

      <div className="sidebar">
        <button onClick={handleScrapeProjects} disabled={scraping} className="scrape-button">
          {scraping ? 'در حال استخراج...' : 'شروع استخراج'}
          <FontAwesomeIcon icon={faGear} />

        </button>
        <div className="project-list">
          {projects.map((project) => (
            <div key={project.projectID} className="project-item">
              <h4>{project.title}</h4>
              <p>{project.description}</p>
              <p>{project.budget}</p>
              <p>{project.timePosted}</p>
              <p>{project.skills.join(', ')}</p>
              <button
                onClick={() => handleActiveProject(project)}
                className="send-bid-button"
              >
                ارسال پیشنهاد
                <FontAwesomeIcon icon={faMessage} />

              </button>

            </div>
          ))}
        </div>
      </div>

      <div className="chat-container">
        {/* <h1>گفتــــ و گو</h1> */}
        <div className="chat-history">
          {messages.map((message, index) => (
            <div key={index} className="message">
              {message}
            </div>
          ))}
          {loading && <div className="loading-message">در حال پردازش...</div>}
        </div>
        <div className="input-container">
          <input
            type="text"
            placeholder="متن درخواست خود را بنویسید"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <button onClick={() => handleSendMessage()}>ارســـال
            <FontAwesomeIcon icon={faMagicWandSparkles} />

          </button>

        </div>
      </div>
    </div>
  );
}

export default App;
