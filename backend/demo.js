async function readPdf(pdfPath) {
    try {
        if (!globalThis.structuredClone) {
            globalThis.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
          }
      const pdfjsLib = await import('pdfjs-dist');
  
      const pdf = await pdfjsLib.getDocument(pdfPath).promise;
      const questionsAndAnswers = [];
  
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
  
        extractQuestionsAndAnswers(textContent.items, textContent, questionsAndAnswers);
      }
  
      console.log("Questions and Answers:", questionsAndAnswers);
    } catch (error) {
      console.error('Error:', error);
    }
  }
  
  function extractQuestionsAndAnswers(textItems, textContent, questionsAndAnswers) {
    let currentQuestion = "";
    const options = [];
    let idx=0;
  
    textItems.forEach((item) => {
      const text = item.str.trim();
  
      if (/^\d+\.\s+.+$/.test(text)) {
        console.log("New question:", text);
        if (currentQuestion && options.length > 0) {
          console.log("Pushing previous question:", currentQuestion, options);
          questionsAndAnswers[idx]={ question: currentQuestion, options };
          idx++;
        }
        currentQuestion = text;
        options.length = 0; // Clear options for new question
      } else {
        if (/^\s*[a-zA-Z]\S+.+$/.test(text)) {
          options.push(text); // Add option without starting letter and period
        }
      }
    });
  
    // Push the last question and options (if any)
    if (currentQuestion && options.length > 0) {
      questionsAndAnswers[idx]={ question: currentQuestion, options };
    }
  }
  
  // Example usage:
  const pdfPath = 'file://C:/Users/pabhi/Downloads/New folder (3)/1.pdf';
  readPdf(pdfPath).catch(console.error);