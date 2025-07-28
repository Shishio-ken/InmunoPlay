// Este archivo se sirve estáticamente, así que pasa CSP
fetch('/quiz-data.json')
  .then(r => r.json())
  .then(data => {
    window.staticQuestions = data.static;
    window.dynamicQuestions = data.dynamic;
  });
