// Background script for NameSnapper extension

// Initialize extension
browser.runtime.onInstalled.addListener(function(details) {
  if (details.reason === 'install') {
    console.log('NameSnapper extension installed');
    
    // Initialize storage
    browser.storage.local.set({
      markedNames: [],
      blacklistedNames: [],
      settings: {
        autoDetect: true,
        minWordCount: 100,
        skipStrongTags: true,
        highlightColor: 'yellow'
      }
    });
  }
});

// Handle messages from content script or popup
browser.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'saveMarkedNames') {
    // Save marked names to storage
    browser.storage.local.get(['markedNames'], function(result) {
      const existingNames = result.markedNames || [];
      const newNames = [...new Set([...existingNames, ...request.names])]; // Remove duplicates
      
      browser.storage.local.set({
        markedNames: newNames
      }, function() {
        sendResponse({success: true, totalCount: newNames.length});
      });
    });
    
    return true;
  }
  
  if (request.action === 'getMarkedNames') {
    browser.storage.local.get(['markedNames'], function(result) {
      sendResponse({names: result.markedNames || []});
    });
    
    return true;
  }
  
  if (request.action === 'clearMarkedNames') {
    browser.storage.local.set({markedNames: []}, function() {
      sendResponse({success: true});
    });
    
    return true;
  }
  
  if (request.action === 'blacklistName') {
    // Add name to blacklist and remove from marked names
    browser.storage.local.get(['markedNames', 'blacklistedNames'], function(result) {
      const markedNames = result.markedNames || [];
      const blacklistedNames = result.blacklistedNames || [];
      
      // Add to blacklist if not already there
      if (!blacklistedNames.includes(request.name)) {
        blacklistedNames.push(request.name);
      }
      
      // Remove from marked names
      const updatedMarkedNames = markedNames.filter(name => name !== request.name);
      
      browser.storage.local.set({
        markedNames: updatedMarkedNames,
        blacklistedNames: blacklistedNames
      }, function() {
        sendResponse({success: true});
      });
    });
    
    return true;
  }
  
  if (request.action === 'getBlacklistedNames') {
    browser.storage.local.get(['blacklistedNames'], function(result) {
      sendResponse({names: result.blacklistedNames || []});
    });
    
    return true;
  }
  
  if (request.action === 'unblacklistName') {
    // Remove name from blacklist
    browser.storage.local.get(['blacklistedNames'], function(result) {
      const blacklistedNames = result.blacklistedNames || [];
      const updatedBlacklistedNames = blacklistedNames.filter(name => name !== request.name);
      
      browser.storage.local.set({
        blacklistedNames: updatedBlacklistedNames
      }, function() {
        sendResponse({success: true});
      });
    });
    
    return true;
  }
  
  if (request.action === 'runNameMarking') {
    // Send message to content script to run name marking
    browser.tabs.query({active: true, currentWindow: true}, function(tabs) {
      browser.tabs.sendMessage(tabs[0].id, {action: 'startNameMarking'}, function(response) {
        sendResponse(response);
      });
    });
    
    return true;
  }
  
  if (request.action === 'removeHighlights') {
    // Send message to content script to remove highlights
    browser.tabs.query({active: true, currentWindow: true}, function(tabs) {
      browser.tabs.sendMessage(tabs[0].id, {action: 'removeHighlights'}, function(response) {
        sendResponse(response);
      });
    });
    
    return true;
  }
});

// Add context menu item
browser.contextMenus.create({
  id: 'markNames',
  title: 'Mark names on this page',
  contexts: ['page']
});

browser.contextMenus.onClicked.addListener(function(info, tab) {
  if (info.menuItemId === 'markNames') {
    browser.tabs.sendMessage(tab.id, {action: 'startNameMarking'});
  }
});

browser.contextMenus.onClicked.addListener(function(info, tab) {
  if (info.menuItemId === 'snapNames') {
    browser.tabs.sendMessage(tab.id, {action: 'snapNames'});
  }
});
