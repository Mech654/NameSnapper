(function(){
  'use strict';

  function isSkippable(el) {
    const SKIP = new Set(['SCRIPT','STYLE','NOSCRIPT','IFRAME','HEAD','LINK','META','TITLE']);    
    return !el || SKIP.has(el.tagName);
  }

  function highlight(node, start, length) {
    if (start < 0 || length <= 0 || start + length > node.nodeValue.length) return;
    const range = document.createRange();
    range.setStart(node, start);
    range.setEnd(node, start + length);
    const span = document.createElement('span');
    span.style.backgroundColor = 'yellow';
    range.surroundContents(span);
    range.detach();
  }

  function analyzeWordPatterns(fullText) {
    const wordAnalysis = new Map();
    const capWordRegex = /\b([A-Z][a-z]+)\b/g;
    let match;
    
    while ((match = capWordRegex.exec(fullText))) {
      const word = match[1];
      const position = match.index;
      const before = fullText.slice(Math.max(0, position - 50), position);
      const after = fullText.slice(position + word.length, Math.min(fullText.length, position + word.length + 50));
      
      if (!wordAnalysis.has(word)) {
        wordAnalysis.set(word, {
          count: 0,
          afterPunctuation: 0,
          midSentence: 0,
          contexts: []
        });
      }
      
      const analysis = wordAnalysis.get(word);
      analysis.count++;
      analysis.contexts.push({ before, after });
      
      if (/[.!?]\s*$/.test(before)) {
        analysis.afterPunctuation++;
      } else {
        analysis.midSentence++;
      }
    }
    
    return wordAnalysis;
  }

  function isPotentialName(word, wordAnalysis) {
    const analysis = wordAnalysis.get(word);
    if (!analysis) return false;
    
    if (word.length < 2) return false;
    
    if (analysis.count > 1 && analysis.midSentence === 0) return false;
    
    const midSentenceRatio = analysis.midSentence / analysis.count;
    
    if (analysis.count > 1 && midSentenceRatio > 0.3) return true;
    
    if (analysis.count === 1 && analysis.midSentence === 1) {
      const context = analysis.contexts[0];
      if (/["']\s*$/.test(context.before) || /^\s*["']/.test(context.after)) return true;
      if (/\b(said|asked|replied|whispered|shouted|called|named)\s*$/i.test(context.before)) return true;
    }
    
    return false;
  }

  function isFirstWordInElement(textNode, matchIndex) {
    const txt = textNode.nodeValue;
    const beforeMatch = txt.slice(0, matchIndex);
    
    if (beforeMatch.trim() === '') {
      const parent = textNode.parentElement;
      if (!parent) return true;
      
      const siblings = Array.from(parent.childNodes);
      const nodeIndex = siblings.indexOf(textNode);
      
      for (let i = 0; i < nodeIndex; i++) {
        const sibling = siblings[i];
        if (sibling.nodeType === Node.TEXT_NODE && sibling.nodeValue.trim()) {
          return false;
        }
        else if (sibling.nodeType === Node.ELEMENT_NODE && sibling.textContent.trim()) {
          return false;
        }
      }
      return true;
    }
    
    return /^\s*$/.test(beforeMatch);
  }

  function processTextNode(textNode, wordAnalysis) {
    const txt = textNode.nodeValue;
    
    const capRE = /\b([A-Z][a-z]+)\b/g;
    let match;
    const matches = [];
    
    while ((match = capRE.exec(txt))) {
      const word = match[1];
      const matchIndex = match.index;
      
      if (isFirstWordInElement(textNode, matchIndex)) {
        continue;
      }
      
      if (isPotentialName(word, wordAnalysis)) {
        matches.push({ word, start: matchIndex, length: word.length });
      }
    }
    
    for (let i = matches.length - 1; i >= 0; i--) {
      const match = matches[i];
      highlight(textNode, match.start, match.length);
      console.log(`Marked potential name: "${match.word}" at index ${match.start}`);
    }
  }

  function MarkNames() {
    console.log('MarkNames dynamic detection');
    const fullText = document.body.textContent || '';
    const wordAnalysis = analyzeWordPatterns(fullText);
    
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
          const p = node.parentElement;
          if (isSkippable(p)) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        }
      },
      false
    );

    const textNodes = [];
    let textNode;
    while (textNode = walker.nextNode()) {
      textNodes.push(textNode);
    }
    
    textNodes.forEach(node => processTextNode(node, wordAnalysis));
  }

  MarkNames();
})();
