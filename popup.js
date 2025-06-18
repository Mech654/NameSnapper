document.addEventListener('DOMContentLoaded', function() {
  const snapNamesBtn = document.getElementById('snapNamesBtn');
  const viewSnappedBtn = document.getElementById('viewSnappedBtn');
  const clearDataBtn = document.getElementById('clearDataBtn');
  const status = document.getElementById('status');

  // Show status message
  function showStatus(message, isError = false) {
    status.textContent = message;
    status.className = isError ? 'status error' : 'status';
    status.classList.remove('hidden');
    
    setTimeout(() => {
      status.classList.add('hidden');
    }, 3000);
  }

  // Snap names from current page
  snapNamesBtn.addEventListener('click', function() {
    browser.tabs.query({active: true, currentWindow: true}, function(tabs) {
      browser.tabs.sendMessage(tabs[0].id, {action: 'snapNames'}, function(response) {
        if (response && response.success) {
          showStatus(`Snapped ${response.count} names!`);
        } else {
          showStatus('Failed to snap names', true);
        }
      });
    });
  });

  // View snapped names
  viewSnappedBtn.addEventListener('click', function() {
    browser.storage.local.get(['snappedNames'], function(result) {
      const names = result.snappedNames || [];
      if (names.length === 0) {
        showStatus('No names snapped yet');
      } else {
        // Create a simple display of names
        const namesDisplay = names.slice(0, 5).join(', ');
        const totalCount = names.length;
        showStatus(`Latest: ${namesDisplay}${totalCount > 5 ? ` (+${totalCount - 5} more)` : ''}`);
      }
    });
  });

  // Clear all data
  clearDataBtn.addEventListener('click', function() {
    if (confirm('Are you sure you want to clear all snapped names?')) {
      browser.storage.local.clear(function() {
        showStatus('All data cleared');
      });
    }
  });
});
