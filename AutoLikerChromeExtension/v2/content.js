// تابع تاخیر
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function autoLikePosts(totalLikes) {
  let liked = 0;
  let scrollStep = 3;
  let lastScrollHeight = 0;
  let tryCount = 0;

  while (liked < totalLikes && tryCount < 20) {
    const posts = Array.from(document.querySelectorAll('[role="article"]'));
    let newLikes = 0;
    for (let i = 0; i < posts.length && liked < totalLikes; i++) {
      const post = posts[i];
      const likeButton = post.querySelector('button[data-testid="like"]');
      const unlikeButton = post.querySelector('button[data-testid="unlike"]');
      if (likeButton && !unlikeButton) {
        likeButton.click();
        liked++;
        newLikes++;
        window.postMessage({ type: 'AUTO_LIKE_STATUS', status: `لایک ${liked} از ${totalLikes}` }, '*');
        await sleep(1500);
        if (liked % scrollStep === 0 && liked < totalLikes) {
          window.scrollBy({ top: 600, behavior: 'smooth' });
          await sleep(1800);
        }
      }
    }
    if (newLikes === 0) {
      // اگر پست جدیدی نبود، اسکرول کن تا پست‌های جدید بیاید
      window.scrollBy({ top: 800, behavior: 'smooth' });
      await sleep(2000);
      tryCount++;
    }
  }
  window.postMessage({ type: 'AUTO_LIKE_STATUS', status: `پایان! ${liked} پست لایک شد.` }, '*');
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'startAutoLike' && typeof msg.likeCount === 'number') {
    autoLikePosts(msg.likeCount);
  }
});

// ارتباط با popup برای نمایش وضعیت
window.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'AUTO_LIKE_STATUS') {
    chrome.runtime.sendMessage({ status: event.data.status });
  }
}); 