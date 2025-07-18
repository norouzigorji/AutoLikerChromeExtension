// A simple function to add a delay between actions
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function likeFirstThreePosts() {
  console.log("ربات لایکر: اسکریپت شروع به کار کرد.");

  // Find all posts on the page using the role attribute
  const posts = document.querySelectorAll('[role="article"]');
  
  if (posts.length === 0) {
    console.log("ربات لایکر: هیچ پستی با مشخصه role='article' پیدا نشد.");
    return;
  }

  // Take the first 5 posts
  const postsToLike = Array.from(posts).slice(0, 5);
  let likeCount = 0;

  for (const post of postsToLike) {
    // Find the "Like" button using the precise selector
    const likeButton = post.querySelector('button[data-testid="like"]');
    
    // Check if the button is not already liked (it won't have 'data-testid="unlike"')
    const unlikeButton = post.querySelector('button[data-testid="unlike"]');

    if (likeButton && !unlikeButton) {
      console.log("ربات لایکر: دکمه لایک پیدا شد، در حال کلیک کردن...");
      likeButton.click();
      likeCount++;
      // Wait for 1.5 seconds to ensure the action is registered by the server
      await sleep(1500); 
    } else if (unlikeButton) {
        console.log("ربات لایکر: این پست قبلاً لایک شده است.");
    } else {
      console.log("ربات لایکر: دکمه لایک در این پست پیدا نشد.");
    }
  }

  // Log the final message to the console instead of using alert
  if (likeCount > 0) {
    console.log(`ربات لایکر: عملیات با موفقیت انجام شد! ${likeCount} پست جدید لایک شد.`);
  } else {
    console.log("ربات لایکر: هیچ پست جدیدی برای لایک کردن پیدا نشد.");
  }
}

likeFirstThreePosts();