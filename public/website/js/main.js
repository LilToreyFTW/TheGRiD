// GRiD Website - Complete JavaScript Functionality
let currentMods = [];
let currentPosts = [];
let downloadInProgress = false;

// Tab switching with smooth transitions
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const tab = link.getAttribute('data-tab');
        
        // Skip if Discord link
        if (link.classList.contains('discord-nav-link')) {
            return;
        }
        
        // Update active nav
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        // Update active tab with fade
        document.querySelectorAll('.tab-content').forEach(t => {
            t.classList.remove('active');
        });
        
        setTimeout(() => {
            const targetTab = document.getElementById(tab);
            if (targetTab) {
                targetTab.classList.add('active');
            }
        }, 150);
        
        // Load content
        if (tab === 'mods') {
            loadMods();
        } else if (tab === 'forums') {
            loadForums();
        }
    });
});

// Download game function with progress tracking
async function downloadGame(platform) {
    if (downloadInProgress) {
        alert('Download already in progress!');
        return;
    }
    
    downloadInProgress = true;
    
    // Show download card progress
    const downloadCard = event.target.closest('.download-card');
    const progressDiv = downloadCard.querySelector('.download-progress') || createProgressDiv(downloadCard);
    const progressBar = progressDiv.querySelector('.progress-fill');
    const progressText = progressDiv.querySelector('.progress-text');
    
    progressDiv.classList.add('active');
    
    try {
        // Simulate download progress
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 100) progress = 100;
            
            progressBar.style.width = progress + '%';
            progressText.textContent = `Downloading... ${Math.floor(progress)}%`;
            
            if (progress >= 100) {
                clearInterval(interval);
                progressText.textContent = 'Download Complete!';
                
                // Trigger actual download
                const link = document.createElement('a');
                link.href = '/downloads/GRiD-Setup.exe'; // Will be served from server
                link.download = 'GRiD-Setup.exe';
                link.click();
                
                setTimeout(() => {
                    progressDiv.classList.remove('active');
                    downloadInProgress = false;
                }, 2000);
            }
        }, 200);
        
        // Fallback: If server download fails, show message
        setTimeout(() => {
            if (progress < 100) {
                clearInterval(interval);
                progressText.textContent = 'Download available! Click to download.';
                alert('EXE file will be available after building. Run: npm run build:exe');
                progressDiv.classList.remove('active');
                downloadInProgress = false;
            }
        }, 10000);
        
    } catch (error) {
        console.error('Download error:', error);
        alert('Download failed. Please try again or contact support.');
        downloadInProgress = false;
    }
}

function createProgressDiv(card) {
    const progressDiv = document.createElement('div');
    progressDiv.className = 'download-progress';
    progressDiv.innerHTML = `
        <div class="progress-text">Preparing download...</div>
        <div class="progress-bar">
            <div class="progress-fill"></div>
        </div>
    `;
    card.appendChild(progressDiv);
    return progressDiv;
}

function playWeb() {
    // Open game in new tab
    const gameUrl = window.location.origin + '/game/index.html';
    window.open(gameUrl, '_blank');
}

// Load mods from localStorage or default
function loadMods() {
    const storedMods = localStorage.getItem('gridMods');
    currentMods = storedMods ? JSON.parse(storedMods) : getDefaultMods();
    
    // Apply search filter if active
    const searchInput = document.getElementById('mod-search');
    if (searchInput && searchInput.value) {
        filterMods(searchInput.value);
    } else {
        renderMods();
    }
}

function getDefaultMods() {
    return [
        {
            id: 1,
            name: 'Enhanced Graphics Pack',
            description: 'Improved textures, lighting effects, and visual enhancements for better graphics quality.',
            version: '1.0.0',
            downloads: 1250,
            author: 'GRiD Team',
            thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjIyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiMwMGZmZmYiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNmZjAwZmYiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMjgwIiBoZWlnaHQ9IjIyMCIgZmlsbD0idXJsKCNnKSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiNmZmZmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmb250LXdlaWdodD0iYm9sZCI+RW5oYW5jZWQgR3JhcGhpY3M8L3RleHQ+PC9zdmc+'
        },
        {
            id: 2,
            name: 'Custom Bike Skins',
            description: '100+ custom bike skin designs with unique patterns and colors. Express your style!',
            version: '2.1.0',
            downloads: 890,
            author: 'Modder123',
            thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjIyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiMwMGZmMDAiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMwMGZmZmYiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMjgwIiBoZWlnaHQ9IjIyMCIgZmlsbD0idXJsKCNnKSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiNmZmZmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmb250LXdlaWdodD0iYm9sZCI+QmlrZSBTa2luczwvdGV4dD48L3N2Zz4='
        },
        {
            id: 3,
            name: 'Weapon Pack Expansion',
            description: 'New weapons and tools for the BORTtheBOT printer system. Expand your arsenal!',
            version: '1.5.0',
            downloads: 650,
            author: 'WeaponMaster',
            thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjIyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmZmFhMDAiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNmZjAwZmYiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMjgwIiBoZWlnaHQ9IjIyMCIgZmlsbD0idXJsKCNnKSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiNmZmZmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmb250LXdlaWdodD0iYm9sZCI+V2VhcG9uczwvdGV4dD48L3N2Zz4='
        },
        {
            id: 4,
            name: 'Planet Expansion Pack',
            description: 'Unlock 10 additional planets with unique environments and challenges.',
            version: '1.2.0',
            downloads: 420,
            author: 'ExplorerMod',
            thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjIyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiM1ODY1RjIiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMwMGZmZmYiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMjgwIiBoZWlnaHQ9IjIyMCIgZmlsbD0idXJsKCNnKSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiNmZmZmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmb250LXdlaWdodD0iYm9sZCI+UGxhbmV0czwvdGV4dD48L3N2Zz4='
        }
    ];
}

function renderMods(modsToRender = currentMods) {
    const grid = document.getElementById('mods-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    if (modsToRender.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 60px; color: #888;">No mods found. Be the first to upload one!</div>';
        return;
    }
    
    modsToRender.forEach(mod => {
        const card = document.createElement('div');
        card.className = 'mod-card';
        card.innerHTML = `
            <img src="${mod.thumbnail}" alt="${mod.name}" class="mod-thumbnail" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjIyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjgwIiBoZWlnaHQ9IjIyMCIgZmlsbD0iIzMzMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM0Q0FGNTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Nb2Q8L3RleHQ+PC9zdmc+'">
            <div class="mod-info">
                <h3>${mod.name}</h3>
                <p>${mod.description}</p>
                <div class="mod-meta">
                    <span>v${mod.version}</span>
                    <span>${mod.downloads.toLocaleString()} downloads</span>
                </div>
                <button class="btn-install" onclick="installMod(${mod.id})">Install Mod</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

function filterMods(searchTerm) {
    const filtered = currentMods.filter(mod => 
        mod.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mod.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    renderMods(filtered);
}

// Mod search functionality
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('mod-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            filterMods(e.target.value);
        });
    }
});

function installMod(modId) {
    const mod = currentMods.find(m => m.id === modId);
    if (!mod) return;
    
    // Save to localStorage (in production, download and install)
    const installedMods = JSON.parse(localStorage.getItem('installedMods') || '[]');
    if (!installedMods.find(m => m.id === modId)) {
        installedMods.push(mod);
        localStorage.setItem('installedMods', JSON.stringify(installedMods));
        
        // Show success notification
        showNotification(`Mod "${mod.name}" installed successfully! Restart the game to apply changes.`, 'success');
    } else {
        showNotification('Mod already installed!', 'info');
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 20px 30px;
        background: ${type === 'success' ? 'rgba(0, 255, 0, 0.2)' : 'rgba(0, 255, 255, 0.2)'};
        border: 2px solid ${type === 'success' ? '#00ff00' : '#00ffff'};
        border-radius: 10px;
        color: ${type === 'success' ? '#00ff00' : '#00ffff'};
        font-weight: bold;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        max-width: 400px;
        box-shadow: 0 0 30px rgba(0, 255, ${type === 'success' ? '0' : '255'}, 0.5);
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Upload mod modal
function showUploadModal() {
    document.getElementById('upload-modal').style.display = 'block';
}

function closeUploadModal() {
    document.getElementById('upload-modal').style.display = 'none';
}

function uploadMod(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    
    const modData = {
        id: Date.now(),
        name: formData.get('name'),
        description: formData.get('description'),
        version: formData.get('version'),
        downloads: 0,
        author: 'You',
        thumbnail: formData.get('thumbnail') ? URL.createObjectURL(formData.get('thumbnail')) : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjIyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjgwIiBoZWlnaHQ9IjIyMCIgZmlsbD0iIzMzMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM0Q0FGNTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Nb2Q8L3RleHQ+PC9zdmc+'
    };
    
    // In production, upload to server
    currentMods.push(modData);
    localStorage.setItem('gridMods', JSON.stringify(currentMods));
    
    showNotification('Mod uploaded successfully!', 'success');
    closeUploadModal();
    event.target.reset();
    renderMods();
}

// Load forums
function loadForums() {
    currentPosts = [
        { id: 1, title: 'Welcome to GRiD!', author: 'Admin', date: '2024-01-15', category: 'General Discussion', replies: 24 },
        { id: 2, title: 'How to install mods?', author: 'User123', date: '2024-01-14', category: 'Modding', replies: 12 },
        { id: 3, title: 'Best bike designs showcase', author: 'BikeMaster', date: '2024-01-13', category: 'General Discussion', replies: 45 },
        { id: 4, title: 'Performance optimization tips', author: 'TechGuru', date: '2024-01-12', category: 'Technical Support', replies: 8 },
        { id: 5, title: 'New planet discovered!', author: 'Explorer', date: '2024-01-11', category: 'General Discussion', replies: 67 },
        { id: 6, title: 'Ray tracing settings guide', author: 'GraphicsPro', date: '2024-01-10', category: 'Technical Support', replies: 15 }
    ];
    
    renderForums();
}

function renderForums() {
    const list = document.getElementById('post-list');
    if (!list) return;
    
    list.innerHTML = '';
    
    currentPosts.forEach(post => {
        const item = document.createElement('div');
        item.className = 'post-item';
        item.innerHTML = `
            <div class="post-title">${post.title}</div>
            <div class="post-meta">by ${post.author} in ${post.category} • ${post.date} • ${post.replies} replies</div>
        `;
        item.addEventListener('click', () => {
            alert(`Post: ${post.title}\n\nThis would open the full post in a real forum system.`);
        });
        list.appendChild(item);
    });
}

// Close modal on outside click
window.onclick = function(event) {
    const modal = document.getElementById('upload-modal');
    if (event.target === modal) {
        closeUploadModal();
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadMods();
    loadForums();
    
    // Add smooth scroll behavior
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);


