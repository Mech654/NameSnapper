document.addEventListener('DOMContentLoaded', function() {
  const markNamesBtn = document.getElementById('markNames');
  const removeHighlightsBtn = document.getElementById('removeHighlights');
  const viewNamesBtn = document.getElementById('viewNames');
  const clearNamesBtn = document.getElementById('clearNames');
  const status = document.getElementById('status');
  const nameCount = document.getElementById('nameCount');
  const blacklistCount = document.getElementById('blacklistCount');
  const namesList = document.getElementById('namesList');
  const namesContent = document.getElementById('namesContent');
  const namesTab = document.getElementById('namesTab');
  const blacklistTab = document.getElementById('blacklistTab');
  const namesTabCount = document.getElementById('namesTabCount');
  const blacklistTabCount = document.getElementById('blacklistTabCount');
  const searchInput = document.getElementById('searchInput');
  const searchClear = document.getElementById('searchClear');

  let currentTab = 'names';
  let allNames = [];
  let allBlacklisted = [];

  // Initialize popup
  init();

  function init() {
    updateNameCount();
    updateBlacklistCount();
    showStatus('Ready to detect names! Click "Mark Names" to analyze the current page.', 'info');
    setupEventListeners();
  }

  function setupEventListeners() {
    // Tab switching
    namesTab.addEventListener('click', () => switchTab('names'));
    blacklistTab.addEventListener('click', () => switchTab('blacklist'));
    
    // Search functionality
    searchInput.addEventListener('input', handleSearch);
    searchClear.addEventListener('click', clearSearch);
    
    // Show/hide search clear button
    searchInput.addEventListener('input', function() {
      searchClear.style.display = this.value ? 'block' : 'none';
    });
  }

  function switchTab(tab) {
    currentTab = tab;
    
    // Update tab appearance
    if (tab === 'names') {
      namesTab.classList.add('active');
      blacklistTab.classList.remove('active');
    } else {
      blacklistTab.classList.add('active');
      namesTab.classList.remove('active');
    }
    
    // Update search placeholder
    searchInput.placeholder = tab === 'names' ? 'Search names...' : 'Search blacklisted names...';
    clearSearch();
    displayCurrentTab();
  }

  function handleSearch() {
    const query = searchInput.value.toLowerCase().trim();
    displayCurrentTab(query);
  }

  function clearSearch() {
    searchInput.value = '';
    searchClear.style.display = 'none';
    displayCurrentTab();
  }

  // Show status message
  function showStatus(message, type = 'info') {
    status.textContent = message;
    status.className = `status ${type}`;
    
    if (type === 'success' || type === 'error') {
      setTimeout(() => {
        showStatus('Ready to detect names! Click "Mark Names" to analyze the current page.', 'info');
      }, 3000);
    }
  }

  // Update name count display
  function updateNameCount() {
    browser.runtime.sendMessage({action: 'getMarkedNames'}, function(response) {
      if (response && response.names) {
        nameCount.textContent = response.names.length;
        namesTabCount.textContent = response.names.length;
        allNames = response.names;
      }
    });
  }

  // Update blacklist count display
  function updateBlacklistCount() {
    browser.runtime.sendMessage({action: 'getBlacklistedNames'}, function(response) {
      if (response && response.names) {
        blacklistCount.textContent = response.names.length;
        blacklistTabCount.textContent = response.names.length;
        allBlacklisted = response.names;
      }
    });
  }

  // Mark names on current page
  markNamesBtn.addEventListener('click', function() {
    markNamesBtn.classList.add('loading');
    markNamesBtn.textContent = '🔍 Analyzing...';
    showStatus('Analyzing page content and marking character names...', 'info');

    browser.runtime.sendMessage({action: 'runNameMarking'}, function(response) {
      markNamesBtn.classList.remove('loading');
      markNamesBtn.textContent = '🎯 Mark Names on Page';
      
      if (response && response.success) {
        showStatus(`Successfully marked ${response.markedCount || 0} names on the page!`, 'success');
        updateNameCount();
      } else {
        showStatus('Failed to analyze page. Try refreshing and try again.', 'error');
      }
    });
  });

  // Remove highlights from current page
  removeHighlightsBtn.addEventListener('click', function() {
    removeHighlightsBtn.classList.add('loading');
    removeHighlightsBtn.textContent = '🧹 Removing...';
    showStatus('Removing highlights from page...', 'info');

    browser.runtime.sendMessage({action: 'removeHighlights'}, function(response) {
      removeHighlightsBtn.classList.remove('loading');
      removeHighlightsBtn.textContent = '🧹 Remove Highlights';
      
      if (response && response.success) {
        showStatus('All highlights removed from page!', 'success');
      } else {
        showStatus('Failed to remove highlights.', 'error');
      }
    });
  });

  // View stored names
  viewNamesBtn.addEventListener('click', function() {
    Promise.all([
      new Promise(resolve => browser.runtime.sendMessage({action: 'getMarkedNames'}, resolve)),
      new Promise(resolve => browser.runtime.sendMessage({action: 'getBlacklistedNames'}, resolve))
    ]).then(([namesResponse, blacklistResponse]) => {
      allNames = (namesResponse && namesResponse.names) ? namesResponse.names : [];
      allBlacklisted = (blacklistResponse && blacklistResponse.names) ? blacklistResponse.names : [];
      
      // Update tab counts
      namesTabCount.textContent = allNames.length;
      blacklistTabCount.textContent = allBlacklisted.length;
      
      if (allNames.length === 0 && allBlacklisted.length === 0) {
        showStatus('No names stored yet. Mark some names first!', 'info');
        namesList.classList.add('hidden');
      } else {
        namesList.classList.remove('hidden');
        displayCurrentTab();
        showStatus(`Loaded ${allNames.length} names and ${allBlacklisted.length} blacklisted`, 'success');
      }
    }).catch(() => {
      showStatus('Failed to load names.', 'error');
    });
  });

  function displayCurrentTab(searchQuery = '') {
    const data = currentTab === 'names' ? allNames : allBlacklisted;
    let filteredData = data;
    
    if (searchQuery) {
      filteredData = data.filter(name => 
        name.toLowerCase().includes(searchQuery)
      );
    }
    
    namesContent.innerHTML = '';
    
    if (filteredData.length === 0) {
      const noResults = document.createElement('div');
      noResults.className = 'no-results';
      noResults.textContent = searchQuery ? 
        'No matching names found' : 
        (currentTab === 'names' ? 'No names stored yet' : 'No blacklisted names');
      namesContent.appendChild(noResults);
      return;
    }
    
    // Display up to 20 items for performance
    filteredData.slice(0, 20).forEach(name => {
      const nameElement = document.createElement('div');
      nameElement.className = currentTab === 'names' ? 'name-item' : 'name-item blacklisted-item';
      
      const nameText = document.createElement('span');
      nameText.className = 'name-text';
      nameText.textContent = name;
      
      const actionBtn = document.createElement('button');
      actionBtn.className = 'remove-btn';
      
      if (currentTab === 'names') {
        actionBtn.textContent = '✕';
        actionBtn.title = 'Blacklist this name';
        actionBtn.onclick = (e) => {
          e.stopPropagation();
          blacklistName(name, nameElement);
        };
      } else {
        actionBtn.textContent = '↩';
        actionBtn.title = 'Remove from blacklist';
        actionBtn.onclick = (e) => {
          e.stopPropagation();
          unblacklistName(name, nameElement);
        };
      }
      
      nameElement.appendChild(nameText);
      nameElement.appendChild(actionBtn);
      namesContent.appendChild(nameElement);
    });
    
    if (filteredData.length > 20) {
      const moreElement = document.createElement('div');
      moreElement.className = 'name-item';
      moreElement.style.opacity = '0.7';
      moreElement.style.justifyContent = 'center';
      
      const moreText = document.createElement('span');
      moreText.textContent = `+${filteredData.length - 20} more...`;
      moreElement.appendChild(moreText);
      namesContent.appendChild(moreElement);
    }
  }

  // Blacklist a name
  function blacklistName(name, nameElement) {
    if (confirm(`Blacklist "${name}"? This name will no longer be marked on pages.`)) {
      browser.runtime.sendMessage({action: 'blacklistName', name: name}, function(response) {
        if (response && response.success) {
          // Remove from display with animation
          nameElement.style.opacity = '0.5';
          nameElement.style.transform = 'translateX(-100%)';
          
          setTimeout(() => {
            // Update data arrays
            allNames = allNames.filter(n => n !== name);
            allBlacklisted.push(name);
            
            // Update counts
            updateNameCount();
            updateBlacklistCount();
            
            // Refresh display
            displayCurrentTab();
          }, 300);
          
          showStatus(`"${name}" has been blacklisted`, 'success');
        } else {
          showStatus('Failed to blacklist name.', 'error');
        }
      });
    }
  }

  // Remove from blacklist
  function unblacklistName(name, nameElement) {
    if (confirm(`Remove "${name}" from blacklist? This name can be marked again.`)) {
      browser.runtime.sendMessage({action: 'unblacklistName', name: name}, function(response) {
        if (response && response.success) {
          // Remove from display with animation
          nameElement.style.opacity = '0.5';
          nameElement.style.transform = 'translateX(-100%)';
          
          setTimeout(() => {
            // Update data arrays
            allBlacklisted = allBlacklisted.filter(n => n !== name);
            
            // Update counts
            updateBlacklistCount();
            
            // Refresh display
            displayCurrentTab();
          }, 300);
          
          showStatus(`"${name}" removed from blacklist`, 'success');
        } else {
          showStatus('Failed to remove from blacklist.', 'error');
        }
      });
    }
  }

  // Clear all stored names
  clearNamesBtn.addEventListener('click', function() {
    if (confirm('Are you sure you want to clear all stored names? This cannot be undone.')) {
      browser.runtime.sendMessage({action: 'clearMarkedNames'}, function(response) {
        if (response && response.success) {
          showStatus('All stored names cleared!', 'success');
          allNames = [];
          updateNameCount();
          namesList.classList.add('hidden');
          namesContent.innerHTML = '';
        } else {
          showStatus('Failed to clear names.', 'error');
        }
      });
    }
  });

  // Handle clicks to hide names list
  document.addEventListener('click', function(e) {
    if (!namesList.contains(e.target) && e.target !== viewNamesBtn) {
      namesList.classList.add('hidden');
    }
  });
});
