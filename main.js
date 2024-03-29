window.onerror = function (message, source, lineno, colno, error) {
  alert(message);
  console.log(message, source, lineno, colno, error);
  return true;
}

var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition
var SpeechGrammarList = SpeechGrammarList || window.webkitSpeechGrammarList
var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent
var synth = window.speechSynthesis;

if (!SpeechRecognition) {
  alert('Speech Recognition is not supported in your browser');
}
if (!SpeechRecognitionEvent) {
  alert('Speech Recognition is not supported in your browser');
}
if (!synth) {
  alert('Speech Synthesis is not supported in your browser');
}

function parseTexts(data) {
  return (data || '')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .filter(line => !line.startsWith('#'));
}

const raw = localStorage.getItem('texts') || (await (await fetch('default.txt')).text());
const texts = parseTexts(raw);
let index = parseInt(localStorage.getItem('index') || '0');

const next = (seek) => {
  if (typeof seek === 'number') {
    index = seek;
  }
  else {
    index++;
  }
  if (index >= texts.length) {
    return false
  }
  else {
    localStorage.setItem('index', index.toString());
    sentence.textContent = texts[index];
    play(texts[index]);
    return true;
  }
}

const recognition = new SpeechRecognition();
recognition.continuous = false;
recognition.lang = 'en-US';
recognition.interimResults = false;
recognition.maxAlternatives = 1;
if (SpeechGrammarList) {
  // SpeechGrammarList is not currently available in Safari, and does not have any effect in any other browser.
  // This code is provided as a demonstration of possible capability. You may choose not to use it.
  const speechRecognitionList = new SpeechGrammarList();
  for (let text of texts) {
    const grammar = '#JSGF V1.0; grammar sentence; public <sentence> = ' + text + ' ;'
    speechRecognitionList.addFromString(grammar);
  }
  recognition.grammars = speechRecognitionList;
}

const sentenceContainer = document.querySelector('.sentence-container');
const sentence = document.querySelector('.sentence');
const diagnostic = document.querySelector('.output');
const record = document.querySelector('.record');
const replay = document.querySelector('.replay');
const settings = document.querySelector('.settings');
const save = document.querySelector('.save');
const shuffle = document.querySelector('.shuffle');
const dialog = document.querySelector('dialog');

sentenceContainer.open = localStorage.getItem('view-sentence') != 'off';
sentenceContainer.addEventListener('toggle', function () {
  localStorage.setItem('view-sentence', sentenceContainer.open ? 'on' : 'off');
})

record.addEventListener('click', function () {
  recognition.start();
  diagnostic.textContent = 'Listening...';
})

replay.addEventListener('click', function () {
  play(texts[index]);
})

recognition.onresult = function (event) {
  diagnostic.textContent = 'Result received: ';
  const transcript = event.results[0][0].transcript;
  diagnostic.textContent = 'Result received: ' + transcript + '.';

  if (normalizeText(transcript) === normalizeText(texts[index])) {
    if (next()) {
      diagnostic.textContent = 'Correct!';
    }
    else {
      diagnostic.textContent = 'Congrats! You have completed the conversation!';
    }
  }
}

recognition.onspeechend = function () {
  recognition.stop();
}

recognition.onnomatch = function (event) {
  diagnostic.textContent = "I didn't recognise.";
}

recognition.onerror = function (event) {
  diagnostic.textContent = 'Error occurred in recognition: ' + event.error;
}

next(index)


function normalizeText(text) {
  return (' ' + text.toLowerCase())
    .replace(/\s+/g, ' ')
    .replace(/[!?.,]/g, '')
    .replace(/:00/g, '')
    .replaceAll(" is not ", " isn't ")
    .replaceAll(" was not ", " wasn't ")
    .replaceAll(" do not ", " don't ")
    .replaceAll(" does not ", " doesn't ")
    .replaceAll(" did not ", " didn't ")
    .replaceAll(" i am ", " i'm ")
    .replaceAll(" it is ", " it's ")
    .replaceAll(" that is ", " that's ")
    .replaceAll(" we are ", " we're ")
    .trim();
}

function play(text) {
  const utterThis = new SpeechSynthesisUtterance(text);
  synth.speak(utterThis);
}

settings.addEventListener('click', function () {
  document.forms[0].sentences.value = raw;
  dialog.showModal();
})
save.addEventListener('click', function () {
  localStorage.setItem('texts', document.forms[0].sentences.value);
  if (document.forms[0].restart.checked) {
    localStorage.setItem('index', '0');
  }
  location.reload();
})
shuffle.addEventListener('click', function () {
  const data = document.forms[0].sentences.value.split('#');
  
  if (!data[0].trim()) {
    data.shift();
  }
  else {
    data[0] = '\n' + data[0];
  }
  data.sort((a,b) => Math.random() > 0.5 ? 1 : -1);

  document.forms[0].sentences.value = '#' + data.join('#');
})