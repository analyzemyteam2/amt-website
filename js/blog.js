// AnalyzeMyTeam - The Beehive Blog JavaScript
// Interactive functionality for the blog platform

document.addEventListener('DOMContentLoaded', function() {
    initBlogFiltering();
    initBlogSearch();
    initNewsletterSignup();
    initLoadMore();
    initPostInteractions();
    initBlogAnalytics();
});

// Blog Category Filtering
function initBlogFiltering() {
    const categoryButtons = document.querySelectorAll('.category-btn');
    const blogPosts = document.querySelectorAll('.blog-post-card');
    const featuredPost = document.querySelector('.featured-post-card');
    
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            const selectedCategory = this.getAttribute('data-category');
            
            // Update active button
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Filter posts with animation
            filterPosts(selectedCategory, blogPosts, featuredPost);
            
            // Track filtering analytics
            trackBlogEvent('Category Filter', selectedCategory);
        });
    });
}

function filterPosts(category, posts, featuredPost) {
    // Handle featured post visibility
    if (featuredPost) {
        const featuredCategory = featuredPost.getAttribute('data-category');
        if (category === 'all' || category === featuredCategory) {
            showElement(featuredPost);
        } else {
            hideElement(featuredPost);
        }
    }
    
    // Filter regular posts
    posts.forEach(post => {
        const postCategory = post.getAttribute('data-category');
        
        if (category === 'all' || category === postCategory) {
            showElement(post);
        } else {
            hideElement(post);
        }
    });
    
    // Update results count
    updateResultsCount(category);
}

function showElement(element) {
    element.style.display = 'block';
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    
    // Trigger reflow
    element.offsetHeight;
    
    element.style.transition = 'all 0.3s ease';
    element.style.opacity = '1';
    element.style.transform = 'translateY(0)';
}

function hideElement(element) {
    element.style.transition = 'all 0.3s ease';
    element.style.opacity = '0';
    element.style.transform = 'translateY(-20px)';
    
    setTimeout(() => {
        element.style.display = 'none';
    }, 300);
}

// Blog Search Functionality
function initBlogSearch() {
    const searchInput = document.querySelector('.search-input');
    const blogPosts = document.querySelectorAll('.blog-post-card');
    const featuredPost = document.querySelector('.featured-post-card');
    
    if (searchInput) {
        let searchTimeout;
        
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            const searchTerm = this.value.toLowerCase().trim();
            
            // Debounce search to improve performance
            searchTimeout = setTimeout(() => {
                performSearch(searchTerm, blogPosts, featuredPost);
                trackBlogEvent('Search', searchTerm);
            }, 300);
        });
        
        // Clear search on escape
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                this.value = '';
                clearSearch(blogPosts, featuredPost);
            }
        });
    }
}

function performSearch(searchTerm, posts, featuredPost) {
    if (searchTerm === '') {
        clearSearch(posts, featuredPost);
        return;
    }
    
    // Search featured post
    if (featuredPost) {
        const featuredText = featuredPost.textContent.toLowerCase();
        if (featuredText.includes(searchTerm)) {
            showElement(featuredPost);
        } else {
            hideElement(featuredPost);
        }
    }
    
    // Search regular posts
    let visibleCount = 0;
    posts.forEach(post => {
        const postText = post.textContent.toLowerCase();
        
        if (postText.includes(searchTerm)) {
            showElement(post);
            highlightSearchTerm(post, searchTerm);
            visibleCount++;
        } else {
            hideElement(post);
        }
    });
    
    // Show search results count
    showSearchResults(visibleCount, searchTerm);
    
    // Reset category filter when searching
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
}

function clearSearch(posts, featuredPost) {
    // Show all posts
    if (featuredPost) showElement(featuredPost);
    posts.forEach(post => {
        showElement(post);
        removeHighlights(post);
    });
    
    // Reset to "All Posts" category
    const allButton = document.querySelector('[data-category="all"]');
    if (allButton) {
        allButton.classList.add('active');
    }
    
    hideSearchResults();
}

function highlightSearchTerm(post, term) {
    // Simple highlighting for demonstration
    // In production, you'd want more sophisticated highlighting
    const title = post.querySelector('h3');
    const excerpt = post.querySelector('.post-excerpt');
    
    if (title) {
        title.innerHTML = title.textContent.replace(
            new RegExp(term, 'gi'),
            '<mark>$&</mark>'
        );
    }
    
    if (excerpt) {
        excerpt.innerHTML = excerpt.textContent.replace(
            new RegExp(term, 'gi'),
            '<mark>$&</mark>'
        );
    }
}

function removeHighlights(post) {
    const highlights = post.querySelectorAll('mark');
    highlights.forEach(mark => {
        mark.outerHTML = mark.innerHTML;
    });
}

function showSearchResults(count, term) {
    let resultsDiv = document.querySelector('.search-results');
    
    if (!resultsDiv) {
        resultsDiv = document.createElement('div');
        resultsDiv.className = 'search-results';
        document.querySelector('.blog-nav').appendChild(resultsDiv);
    }
    
    resultsDiv.innerHTML = `
        <div class="search-results-content">
            <i class="fas fa-search"></i>
            <span>Found ${count} posts matching "${term}"</span>
            <button class="clear-search" onclick="clearSearchFromButton()">
                <i class="fas fa-times"></i>
                Clear
            </button>
        </div>
    `;
    
    resultsDiv.style.display = 'block';
}

function hideSearchResults() {
    const resultsDiv = document.querySelector('.search-results');
    if (resultsDiv) {
        resultsDiv.style.display = 'none';
    }
}

// Global function for clear search button
function clearSearchFromButton() {
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.value = '';
        const event = new Event('input');
        searchInput.dispatchEvent(event);
    }
}

// Newsletter Signup
function initNewsletterSignup() {
    const signupForm = document.querySelector('.signup-form');
    
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const emailInput = this.querySelector('input[type="email"]');
            const email = emailInput.value.trim();
            
            if (!validateEmail(email)) {
                showBlogNotification('Please enter a valid email address', 'error');
                return;
            }
            
            // Simulate signup process
            const submitBtn = this.querySelector('.signup-btn');
            const originalText = submitBtn.innerHTML;
            
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Joining...';
            submitBtn.disabled = true;
            
            setTimeout(() => {
                showBlogNotification('Welcome to the Defensive Revolution! Check your email for exclusive content.', 'success');
                emailInput.value = '';
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                
                // Track signup
                trackBlogEvent('Newsletter Signup', email);
            }, 2000);
        });
    }
}

// Load More Posts
function initLoadMore() {
    const loadMoreBtn = document.querySelector('.load-more-btn');
    let currentPage = 1;
    
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            currentPage++;
            loadMorePosts(currentPage);
            trackBlogEvent('Load More', `Page ${currentPage}`);
        });
    }
}

function loadMorePosts(page) {
    const loadMoreBtn = document.querySelector('.load-more-btn');
    const originalText = loadMoreBtn.innerHTML;
    
    loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading Intelligence...';
    loadMoreBtn.disabled = true;
    
    // Simulate loading more posts
    setTimeout(() => {
        const newPosts = generateMorePosts(page);
        appendPostsToGrid(newPosts);
        
        loadMoreBtn.innerHTML = originalText;
        loadMoreBtn.disabled = false;
        
        // Hide load more button after 3 pages (simulation)
        if (page >= 3) {
            loadMoreBtn.style.display = 'none';
            showBlogNotification('You\'ve reached the end of our current analysis archive. New content published weekly!', 'info');
        }
        
        showBlogNotification(`Loaded ${newPosts.length} more defensive insights`, 'success');
    }, 1500);
}

function generateMorePosts(page) {
    // Generate sample posts for demonstration
    const morePosts = [
        {
            category: 'triangle-defense',
            title: `Advanced Triangle Positioning: Week ${page} Analysis`,
            excerpt: 'Deep dive into positioning principles that separate championship defenses from the rest...',
            date: `December ${15 - page}, 2024`,
            readTime: '8 min read',
            views: `${2.1 + page * 0.3}k views`,
            stat: '91% efficiency'
        },
        {
            category: 'mo-report',
            title: `College Football Playoff Defensive Breakdown: Page ${page}`,
            excerpt: 'How playoff teams are using Triangle principles to neutralize high-powered offenses...',
            date: `December ${14 - page}, 2024`,
            readTime: '6 min read',
            views: `${1.8 + page * 0.2}k views`,
            stat: 'CFP Analysis'
        }
    ];
    
    return morePosts;
}

function appendPostsToGrid(posts) {
    const blogGrid = document.querySelector('.blog-posts-grid');
    
    posts.forEach(post => {
        const postElement = createPostElement(post);
        blogGrid.appendChild(postElement);
        
        // Animate new post appearance
        setTimeout(() => {
            postElement.style.opacity = '1';
            postElement.style.transform = 'translateY(0)';
        }, 100);
    });
}

function createPostElement(post) {
    const article = document.createElement('article');
    article.className = 'blog-post-card';
    article.setAttribute('data-category', post.category);
    article.style.opacity = '0';
    article.style.transform = 'translateY(20px)';
    article.style.transition = 'all 0.3s ease';
    
    article.innerHTML = `
        <div class="post-category-badge ${post.category}">
            <i class="fas ${getCategoryIcon(post.category)}"></i>
            ${getCategoryName(post.category)}
        </div>
        <div class="post-content">
            <div class="post-meta">
                <span class="post-date">${post.date}</span>
                <span class="read-time">${post.readTime}</span>
            </div>
            <h3>${post.title}</h3>
            <p class="post-excerpt">${post.excerpt}</p>
            <div class="post-stats">
                <div class="post-stat">
                    <i class="fas fa-eye"></i>
                    <span>${post.views}</span>
                </div>
                <div class="post-stat">
                    <i class="fas fa-chart-line"></i>
                    <span>${post.stat}</span>
                </div>
            </div>
            <a href="#" class="post-cta">Continue Reading</a>
        </div>
    `;
    
    return article;
}

function getCategoryIcon(category) {
    const icons = {
        'mo-report': 'fa-graduation-cap',
        'nfl-edge': 'fa-trophy',
        'triangle-defense': 'fa-shapes',
        'analysis': 'fa-chart-line'
    };
    return icons[category] || 'fa-file-alt';
}

function getCategoryName(category) {
    const names = {
        'mo-report': 'The MO Report',
        'nfl-edge': 'The NFL Edge',
        'triangle-defense': 'Triangle Defense',
        'analysis': 'Formation Analysis'
    };
    return names[category] || 'Analysis';
}

// Post Interactions
function initPostInteractions() {
    const postCards = document.querySelectorAll('.blog-post-card');
    const featuredCard = document.querySelector('.featured-post-card');
    
    // Add click tracking to all posts
    [...postCards, featuredCard].forEach(card => {
        if (card) {
            const readButton = card.querySelector('.post-cta, .featured-cta');
            if (readButton) {
                readButton.addEventListener('click', function(e) {
                    e.preventDefault();
                    const title = card.querySelector('h2, h3').textContent;
                    trackBlogEvent('Post Click', title);
                    showBlogNotification('Full article coming soon! Subscribe for early access.', 'info');
                });
            }
        }
    });
    
    // Add hover effects for post stats
    const postStats = document.querySelectorAll('.post-stat');
    postStats.forEach(stat => {
        stat.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
        });
        
        stat.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });
}

// Results Count Update
function updateResultsCount(category) {
    const allPosts = document.querySelectorAll('.blog-post-card:not([style*="display: none"]), .featured-post-card:not([style*="display: none"])');
    const count = allPosts.length;
    
    // Update category button with count
    const activeButton = document.querySelector(`.category-btn[data-category="${category}"]`);
    if (activeButton && category !== 'all') {
        const originalText = activeButton.textContent;
        activeButton.innerHTML = `${activeButton.innerHTML} (${count})`;
        
        setTimeout(() => {
            activeButton.innerHTML = originalText;
        }, 2000);
    }
}

// Blog-specific Notification System
function showBlogNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `blog-notification blog-notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        max-width: 350px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    `;
    
    // Set background color based on type
    const colors = {
        'success': '#28a745',
        'error': '#e2021a',
        'info': '#4e5064',
        'warning': '#fd7e14'
    };
    
    notification.style.background = colors[type] || colors.info;
    
    document.body.appendChild(notification);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        closeNotification(notification);
    });
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        closeNotification(notification);
    }, 5000);
}

function closeNotification(notification) {
    notification.style.transform = 'translateX(400px)';
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 300);
}

function getNotificationIcon(type) {
    const icons = {
        'success': 'fa-check-circle',
        'error': 'fa-exclamation-circle',
        'info': 'fa-info-circle',
        'warning': 'fa-exclamation-triangle'
    };
    return icons[type] || icons.info;
}

// Email Validation
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Blog Analytics Tracking
function initBlogAnalytics() {
    // Track page view
    trackBlogEvent('Page View', 'Beehive Blog');
    
    // Track scroll depth
    let maxScroll = 0;
    window.addEventListener('scroll', debounce(() => {
        const scrollPercentage = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
        if (scrollPercentage > maxScroll) {
            maxScroll = scrollPercentage;
            if (maxScroll % 25 === 0) { // Track at 25%, 50%, 75%, 100%
                trackBlogEvent('Scroll Depth', `${maxScroll}%`);
            }
        }
    }, 1000));
    
    // Track time on page
    const startTime = Date.now();
    window.addEventListener('beforeunload', () => {
        const timeSpent = Math.round((Date.now() - startTime) / 1000);
        trackBlogEvent('Time on Page', `${timeSpent} seconds`);
    });
}

function trackBlogEvent(action, label) {
    // Placeholder for analytics tracking
    // In production, this would integrate with Google Analytics, Mixpanel, etc.
    console.log(`Blog Event: ${action} - ${label}`);
    
    // Example integration:
    // gtag('event', action, {
    //     'event_category': 'Blog Interaction',
    //     'event_label': label
    // });
}

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Keyboard Shortcuts for Power Users
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + K for search focus
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.focus();
            searchInput.select();
        }
    }
    
    // Number keys for category filtering
    if (e.key >= '1' && e.key <= '5') {
        const categoryButtons = document.querySelectorAll('.category-btn');
        const index = parseInt(e.key) - 1;
        if (categoryButtons[index]) {
            categoryButtons[index].click();
        }
    }
});

// Initialize tooltips for advanced users
function initTooltips() {
    const elements = document.querySelectorAll('[data-tooltip]');
    elements.forEach(element => {
        element.addEventListener('mouseenter', showTooltip);
        element.addEventListener('mouseleave', hideTooltip);
    });
}

function showTooltip(e) {
    const tooltip = document.createElement('div');
    tooltip.className = 'custom-tooltip';
    tooltip.textContent = e.target.getAttribute('data-tooltip');
    tooltip.style.cssText = `
        position: absolute;
        background: #333;
        color: white;
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 0.875rem;
        white-space: nowrap;
        z-index: 10000;
        pointer-events: none;
    `;
    
    document.body.appendChild(tooltip);
    
    const rect = e.target.getBoundingClientRect();
    tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
    tooltip.style.top = rect.top - tooltip.offsetHeight - 8 + 'px';
}

function hideTooltip() {
    const tooltip = document.querySelector('.custom-tooltip');
    if (tooltip) {
        tooltip.remove();
    }
}

// Initialize tooltips
initTooltips();
