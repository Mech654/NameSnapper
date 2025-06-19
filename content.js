(function(){
  'use strict';

  function isSkippable(el) {
    const SKIP = new Set(['SCRIPT','STYLE','NOSCRIPT','IFRAME','HEAD','LINK','META','TITLE','STRONG']);    
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
    const capWordRegex = /\b([A-Z][a-z]+(?:-[A-Z][a-z]+)*)\b/g;
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
      
      if (/[.!?'"]\s*$/.test(before) || /^\s*['"]/.test(before.trim())) {
        analysis.afterPunctuation++;
      } else {
        analysis.midSentence++;
      }
    }
    
    return wordAnalysis;
  }

  function isPotentialName(word, wordAnalysis) {
    const analysis = wordAnalysis.get(word);
    if (!analysis) {
      return false;
    }
    
    if (word.length < 2) {
      return false;
    }
    
    if (analysis.count > 1 && analysis.midSentence === 0) {
      return false;
    }
    
    const midSentenceRatio = analysis.midSentence / analysis.count;
    
    if (analysis.count > 1 && midSentenceRatio > 0.3) return true;
    
    if (analysis.count === 1 && analysis.midSentence === 1) {
      return true;
    }
    
    return false;
  }

  function isFirstWordInElement(textNode, matchIndex) {
    const txt = textNode.nodeValue;
    const beforeMatch = txt.slice(0, matchIndex);
    
    // Check if the word comes right after punctuation/symbols that start sentences/dialogue
    const sentenceStarters = /[.!?;:"\[\('"'"„«""''][\s]*$/;
    
    if (beforeMatch.trim() === '' || sentenceStarters.test(beforeMatch)) {
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
    
    return /^\s*$/.test(beforeMatch) || sentenceStarters.test(beforeMatch);
  }

  function processTextNode(textNode, wordAnalysis) {
    const txt = textNode.nodeValue;
    
    const capRE = /\b([A-Z][a-z]+(?:-[A-Z][a-z]+)*)\b/g;
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
    }
  }

  function mergeAdjacentNames() {
    const highlightedSpans = document.querySelectorAll('span[style*="background-color: yellow"]');
    
    for (let i = 0; i < highlightedSpans.length; i++) {
      const currentSpan = highlightedSpans[i];
      let nextNode = currentSpan.nextSibling;
      const spansToMerge = [currentSpan];
      
      while (nextNode) {
        if (nextNode.nodeType === Node.TEXT_NODE && /^\s+$/.test(nextNode.nodeValue)) {
          nextNode = nextNode.nextSibling;
          continue;
        }
        
        if (nextNode.nodeType === Node.ELEMENT_NODE && 
            nextNode.tagName === 'SPAN' && 
            nextNode.style.backgroundColor === 'yellow') {
          spansToMerge.push(nextNode);
          nextNode = nextNode.nextSibling;
        } else {
          break;
        }
      }
      
      if (spansToMerge.length > 1) {
        const parent = currentSpan.parentNode;
        const startNode = spansToMerge[0];
        const endNode = spansToMerge[spansToMerge.length - 1];
        
        const range = document.createRange();
        range.setStartBefore(startNode);
        range.setEndAfter(endNode);
        
        const mergedSpan = document.createElement('span');
        mergedSpan.style.backgroundColor = 'yellow';
        
        try {
          range.surroundContents(mergedSpan);
        } catch (e) {
          // Could not merge adjacent names
        }
        
        range.detach();
      }
    }
  }

  function saveMarkedNamesToStorage() {
    const highlightedSpans = document.querySelectorAll('span[style*="background-color: yellow"]');
    const markedNames = new Set();
    
    highlightedSpans.forEach(span => {
      const name = span.textContent.trim();
      if (name) {
        markedNames.add(name);
      }
    });
    
    const existingNames = JSON.parse(localStorage.getItem('markedNames') || '[]');
    const existingNamesSet = new Set(existingNames);
    
    markedNames.forEach(name => existingNamesSet.add(name));
    
    const finalNames = Array.from(existingNamesSet).sort();
    localStorage.setItem('markedNames', JSON.stringify(finalNames));
  }



  function countWordsInElement(element) {
    const text = element.textContent || '';
    // Split by whitespace and filter out empty strings
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    return words.length;
  }

  function analyzeContentPurity(element) {
    const totalText = element.textContent || '';
    const totalWords = totalText.trim().split(/\s+/).filter(word => word.length > 0).length;
    
    if (totalWords < 100) return { score: 0, details: 'Too few words' };
    
    // Get text from various UI elements to subtract from pure content
    const uiSelectors = [
      'nav', 'header', 'footer', 'aside', 'menu', 
      '.nav', '.menu', '.header', '.footer', '.sidebar', '.navigation',
      'button', 'input', 'select', 'textarea',
      '.button', '.btn', '.link', '.ad', '.advertisement',
      '.comment', '.comments', '.share', '.social'
    ];
    
    let uiWords = 0;
    uiSelectors.forEach(selector => {
      try {
        const uiElements = element.querySelectorAll(selector);
        uiElements.forEach(el => {
          const uiText = el.textContent || '';
          uiWords += uiText.trim().split(/\s+/).filter(word => word.length > 0).length;
        });
      } catch (e) {
        // Ignore selector errors
      }
    });
    
    const pureContentWords = Math.max(0, totalWords - uiWords);
    const purityRatio = pureContentWords / totalWords;
    
    // Analyze text structure
    const paragraphs = element.querySelectorAll('p');
    const paragraphWords = Array.from(paragraphs).reduce((sum, p) => {
      const pText = p.textContent || '';
      return sum + pText.trim().split(/\s+/).filter(word => word.length > 0).length;
    }, 0);
    
    const textDensity = paragraphWords / Math.max(1, totalWords);
    
    // Check for reading flow (sentences, punctuation)
    const sentences = (totalText.match(/[.!?]/g) || []).length;
    const avgWordsPerSentence = sentences > 0 ? totalWords / sentences : 0;
    const hasReadingFlow = avgWordsPerSentence >= 8 && avgWordsPerSentence <= 50;
    
    // Check for chapter-like characteristics
    const hasMultipleParagraphs = paragraphs.length >= 3;
    const hasSubstantialParagraphs = Array.from(paragraphs).some(p => {
      const pWords = (p.textContent || '').trim().split(/\s+/).filter(word => word.length > 0).length;
      return pWords >= 20;
    });
    
    let score = 0;
    
    // Base score from pure content
    score += Math.log10(pureContentWords) * 15;
    
    // Purity bonus (favor elements with less UI junk)
    score += purityRatio * 20;
    
    // Text density bonus (favor elements where most text is in paragraphs)
    score += textDensity * 15;
    
    // Reading flow bonus
    if (hasReadingFlow) score += 10;
    
    // Structure bonuses
    if (hasMultipleParagraphs) score += 8;
    if (hasSubstantialParagraphs) score += 12;
    
    const details = {
      totalWords,
      pureContentWords,
      purityRatio: purityRatio.toFixed(2),
      textDensity: textDensity.toFixed(2),
      paragraphs: paragraphs.length,
      avgWordsPerSentence: avgWordsPerSentence.toFixed(1),
      hasReadingFlow,
      hasMultipleParagraphs,
      hasSubstantialParagraphs
    };
    
    return { score: Math.max(0, score), details };
  }

  function findOptimalContentContainer() {
    // Step 1: Try to find specific content containers first (most targeted)
    const specificSelectors = [
      '#chr-content', '#chapter-content', '#content', '#story-content',
      '.chr-c', '.chapter-content', '.story-content', '.post-content',
      '.entry-content', '.article-content', '.text-content'
    ];
    
    for (const selector of specificSelectors) {
      try {
        const element = document.querySelector(selector);
        if (element && !isSkippable(element)) {
          const wordCount = countWordsInElement(element);
          if (wordCount >= 100) {
            const analysis = analyzeContentPurity(element);
            if (analysis.score > 15) { // Lower threshold for specific containers
              console.log(`Marking names in: ${element.tagName} - XPath: ${getElementXPath(element)}`);
              return [element];
            }
          }
        }
      } catch (e) {
        // Continue if selector fails
      }
    }
    
    // Step 2: Look for semantic content elements
    const semanticElements = document.querySelectorAll('article, main, section');
    const semanticCandidates = [];
    
    for (const element of semanticElements) {
      if (isSkippable(element)) continue;
      
      const wordCount = countWordsInElement(element);
      if (wordCount >= 100 && wordCount <= 5000) { // Avoid massive containers
        const analysis = analyzeContentPurity(element);
        if (analysis.score > 20) {
          semanticCandidates.push({ element, analysis });
        }
      }
    }
    
    if (semanticCandidates.length > 0) {
      // Sort by score and return the best
      semanticCandidates.sort((a, b) => b.analysis.score - a.analysis.score);
      const best = semanticCandidates[0];
      console.log(`Marking names in: ${best.element.tagName} - XPath: ${getElementXPath(best.element)}`);
      return [best.element];
    }
    
    // Step 3: Advanced content detection with stricter filtering
    const allElements = Array.from(document.querySelectorAll('div, section, article'));
    const candidates = [];
    
    for (const element of allElements) {
      if (isSkippable(element)) continue;
      
      const wordCount = countWordsInElement(element);
      
      // Strict word count filtering
      if (wordCount < 100 || wordCount > 3000) continue;
      
      // Skip if it's likely a wrapper/container
      const className = element.className.toLowerCase();
      const id = (element.id || '').toLowerCase();
      const skipPatterns = [
        'wrapper', 'container', 'main', 'page', 'site', 'layout', 
        'header', 'footer', 'sidebar', 'nav', 'menu', 'widget'
      ];
      
      const isLikelyWrapper = skipPatterns.some(pattern => 
        className.includes(pattern) || id.includes(pattern)
      );
      
      if (isLikelyWrapper && wordCount > 1000) continue; // Skip large wrappers
      
      const analysis = analyzeContentPurity(element);
      
      // Much stricter scoring for general divs
      if (analysis.score > 25 && analysis.details.purityRatio >= 0.7) {
        candidates.push({ element, analysis });
      }
    }
    
    if (candidates.length > 0) {
      // Remove parent-child conflicts
      const filteredCandidates = candidates.filter(candidate => {
        return !candidates.some(other => 
          other.element !== candidate.element && 
          other.element.contains(candidate.element) &&
          other.analysis.score >= candidate.analysis.score * 0.9
        );
      });
      
      // Sort by score
      filteredCandidates.sort((a, b) => b.analysis.score - a.analysis.score);
      
      if (filteredCandidates.length > 0) {
        const best = filteredCandidates[0];
        console.log(`Marking names in: ${best.element.tagName} - XPath: ${getElementXPath(best.element)}`);
        return [best.element];
      }
    }
    
    // Step 4: Fallback to body if it has reasonable content
    const bodyWordCount = countWordsInElement(document.body);
    if (bodyWordCount >= 100 && bodyWordCount <= 10000) {
      console.log(`Marking names in: BODY - XPath: ${getElementXPath(document.body)}`);
      return [document.body];
    }
    
    return [];
  }

  function findContentRichElements() {
    const optimalContainers = findOptimalContentContainer();
    
    if (optimalContainers.length === 0) {
      const bodyWordCount = countWordsInElement(document.body);
      if (bodyWordCount >= 100) {
        return [document.body];
      }
      return [];
    }
    
    return optimalContainers;
  }

  function getElementDepth(element) {
    let depth = 0;
    let current = element;
    while (current.parentElement) {
      depth++;
      current = current.parentElement;
    }
    return depth;
  }

  function markNamesInElement(element = document.body) {
    const fullText = element.textContent || '';
    const wordAnalysis = analyzeWordPatterns(fullText);
    
    const walker = document.createTreeWalker(
      element,
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

  function MarkNames() {
    const contentElements = findContentRichElements();
    
    if (contentElements.length === 0) {
      return;
    }
    
    // Process each content-rich element
    contentElements.forEach((element, index) => {
      const xpath = getElementXPath(element);
      console.log(`Marking names in: ${element.tagName} - XPath: ${xpath}`);
      markNamesInElement(element);
    });
    
    // Merge adjacent names across all processed elements
    mergeAdjacentNames();
    saveMarkedNamesToStorage();
  }

  function getElementXPath(element) {
    if (element.id) {
      return `//*[@id="${element.id}"]`;
    }
    
    if (element === document.body) {
      return '/html/body';
    }
    
    let path = '';
    let current = element;
    
    while (current && current !== document.body) {
      let selector = current.tagName.toLowerCase();
      let index = 1;
      
      // Count preceding siblings of the same tag
      let sibling = current.previousElementSibling;
      while (sibling) {
        if (sibling.tagName === current.tagName) {
          index++;
        }
        sibling = sibling.previousElementSibling;
      }
      
      // Check if there are following siblings of the same tag
      let hasFollowingSiblings = false;
      sibling = current.nextElementSibling;
      while (sibling) {
        if (sibling.tagName === current.tagName) {
          hasFollowingSiblings = true;
          break;
        }
        sibling = sibling.nextElementSibling;
      }
      
      // Add index if there are multiple siblings or if not the first
      if (index > 1 || hasFollowingSiblings) {
        selector += `[${index}]`;
      }
      
      path = '/' + selector + path;
      current = current.parentElement;
    }
    
    return '/html/body' + path;
  }

  MarkNames();
})();
