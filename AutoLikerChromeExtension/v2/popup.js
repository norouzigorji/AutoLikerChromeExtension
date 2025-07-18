document.getElementById('startButton').addEventListener('click', () => {
  const likeCount = parseInt(document.getElementById('likeCount').value, 10);
  document.getElementById('status').textContent = 'در حال ارسال فرمان...';
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      files: ['content.js']
    }, () => {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'startAutoLike', likeCount });
      document.getElementById('status').textContent = 'در حال اجرا...';
    });
  });
});

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.status) {
    document.getElementById('status').textContent = msg.status;
  }
}); 