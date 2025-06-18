// Background script for NameSnapper extension

// Initialize extension
browser.runtime.onInstalled.addListener(function(details) {
  if (details.reason === 'install') {
    console.log('NameSnapper extension installed');
    
    // Initialize storage
    browser.storage.local.set({
      snappedNames: [],
      settings: {
        autoSnap: false,
        namePatterns: ['name', 'title', 'label']
      }
    });
  }
});

// Handle messages from content script or popup
browser.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'saveNames') {
    // Save names to storage
    browser.storage.local.get(['snappedNames'], function(result) {
      const existingNames = result.snappedNames || [];
      const newNames = [...existingNames, ...request.names];
      
      browser.storage.local.set({
        snappedNames: newNames
      }, function() {
        sendResponse({success: true, totalCount: newNames.length});
      });
    });
    
    // Return true to indicate we'll send a response asynchronously
    return true;
  }
  
  if (request.action === 'getNames') {
    browser.storage.local.get(['snappedNames'], function(result) {
      sendResponse({names: result.snappedNames || []});
    });
    
    return true;
  }
});

// Optional: Add context menu item
browser.contextMenus.create({
  id: 'snapNames',
  title: 'Snap names from this page',
  contexts: ['page']
});

browser.contextMenus.onClicked.addListener(function(info, tab) {
  if (info.menuItemId === 'snapNames') {
    browser.tabs.sendMessage(tab.id, {action: 'snapNames'});
  }
});
