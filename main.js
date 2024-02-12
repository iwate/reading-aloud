var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition
var SpeechGrammarList = SpeechGrammarList || window.webkitSpeechGrammarList
var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent

if (!SpeechRecognition) {
  alert('Speech Recognition is not supported in your browser');
}
// if (!SpeechGrammarList) {
//   alert('Speech Recognition is not supported in your browser');
// }
if (!SpeechRecognitionEvent) {
    alert('Speech Recognition is not supported in your browser');
}

const texts = [
    'How are you doing today?',
    'Great! How about you?',
    'I am doing well. Thank you for asking.',
    'You are welcome.',
]

let index = 0;

next = (seek) => {
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
        sentence.textContent = texts[index];
        return true;
    }
}

const recognition = new SpeechRecognition();
recognition.continuous = false;
recognition.lang = 'en-US';
recognition.interimResults = false;
recognition.maxAlternatives = 1;
// if (SpeechGrammarList) {
//   // SpeechGrammarList is not currently available in Safari, and does not have any effect in any other browser.
//   // This code is provided as a demonstration of possible capability. You may choose not to use it.
//   var speechRecognitionList = new SpeechGrammarList();
//   var grammar = '#JSGF V1.0; grammar colors; public <color> = ' + colors.join(' | ') + ' ;'
//   speechRecognitionList.addFromString(grammar, 1);
//   recognition.grammars = speechRecognitionList;
// }

const sentence = document.querySelector('.sentence');
const diagnostic = document.querySelector('.output');

document.body.onclick = function() {
  recognition.start();
  diagnostic.textContent = 'Listening...';
}

recognition.onresult = function(event) {
  const transcript = event.results[0][0].transcript;
  diagnostic.textContent = 'Result received: ' + transcript + '.';
  console.log('Confidence: ' + event.results[0][0].confidence);

  if (transcript === texts[index]) {
    if (next()) {
        diagnostic.textContent = 'Correct!';
    }
    else {
        diagnostic.textContent = 'Congrats! You have completed the conversation!';  
    }
  }
}

recognition.onspeechend = function() {
  recognition.stop();
}

recognition.onnomatch = function(event) {
  diagnostic.textContent = "I didn't recognise.";
}

recognition.onerror = function(event) {
  diagnostic.textContent = 'Error occurred in recognition: ' + event.error;
}

next(0)