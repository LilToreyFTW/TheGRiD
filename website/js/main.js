// Website JavaScript
let currentMods = [];
let currentPosts = [];

// Tab switching
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const tab = link.getAttribute('data-tab');
        
        // Update active nav
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        // Update active tab
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        document.getElementById(tab).classList.add('active');
        
        // Load content
        if (tab === 'mods') {
            loadMods();
        } else if (tab === 'forums') {
            loadForums();
        }
    });
});

// Download game
function downloadGame(platform) {
    // In production, this would download the actual EXE
    alert(`Downloading GRiD for ${platform}...\n\nIn production, this would download the game installer.`);
    
    // Simulate download
    const link = document.createElement('a');
    link.href = 'downloads/GRiD-Setup.exe'; // Placeholder
    link.download = 'GRiD-Setup.exe';
    link.click();
}

function playWeb() {
    window.open('index.html', '_blank');
}

// Load mods
function loadMods() {
    // Load mods from localStorage (in production, from server)
    const storedMods = localStorage.getItem('gridMods');
    currentMods = storedMods ? JSON.parse(storedMods) : getDefaultMods();
    
    renderMods();
}

function getDefaultMods() {
    return [
        {
            id: 1,
            name: 'Enhanced Graphics Pack',
            description: 'Improved textures and lighting effects',
            version: '1.0.0',
            downloads: 1250,
            thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjgwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzMzMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM0Q0FGNTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5FbmhhbmNlZCBHcmFwaGljczwvdGV4dD48L3N2Zz4='
        },
        {
            id: 2,
            name: 'Custom Bike Skins',
            description: '100+ custom bike skin designs',
            version: '2.1.0',
            downloads: 890,
            thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjgwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzMzMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM0Q0FGNTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5CaWtlIFNraW5zPC90ZXh0Pjwvc3ZnPg=='
        },
        {
            id: 3,
            name: 'Weapon Pack Expansion',
            description: 'New weapons for the printer system',
            version: '1.5.0',
            downloads: 650,
            thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjgwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzMzMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM0Q0FGNTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5XZWFwb25zPC90ZXh0Pjwvc3ZnPg=='
        }
    ];
}

function renderMods() {
    const grid = document.getElementById('mods-grid');
    grid.innerHTML = '';
    
    currentMods.forEach(mod => {
        const card = document.createElement('div');
        card.className = 'mod-card';
        card.innerHTML = `
            <img src="${mod.thumbnail}" alt="${mod.name}" class="mod-thumbnail">
            <div class="mod-info">
                <h3>${mod.name}</h3>
                <p>${mod.description}</p>
                <div class="mod-meta">
                    <span>v${mod.version}</span>
                    <span>${mod.downloads} downloads</span>
                </div>
                <button class="btn-install" onclick="installMod(${mod.id})">Install Mod</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

function installMod(modId) {
    const mod = currentMods.find(m => m.id === modId);
    if (!mod) return;
    
    // Save to localStorage (in production, download and install)
    const installedMods = JSON.parse(localStorage.getItem('installedMods') || '[]');
    if (!installedMods.find(m => m.id === modId)) {
        installedMods.push(mod);
        localStorage.setItem('installedMods', JSON.stringify(installedMods));
        alert(`Mod "${mod.name}" installed successfully!\n\nRestart the game to apply changes.`);
    } else {
        alert('Mod already installed!');
    }
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
        thumbnail: formData.get('thumbnail') ? URL.createObjectURL(formData.get('thumbnail')) : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjgwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzMzMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM0Q0FGNTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Nb2Q8L3RleHQ+PC9zdmc+'
    };
    
    // In production, upload to server
    currentMods.push(modData);
    localStorage.setItem('gridMods', JSON.stringify(currentMods));
    
    alert('Mod uploaded successfully!');
    closeUploadModal();
    event.target.reset();
    renderMods();
}

// Load forums
function loadForums() {
    currentPosts = [
        { id: 1, title: 'Welcome to GRiD!', author: 'Admin', date: '2024-01-15', category: 'General Discussion' },
        { id: 2, title: 'How to install mods?', author: 'User123', date: '2024-01-14', category: 'Modding' },
        { id: 3, title: 'Best bike designs', author: 'BikeMaster', date: '2024-01-13', category: 'General Discussion' },
        { id: 4, title: 'Performance tips', author: 'TechGuru', date: '2024-01-12', category: 'Technical Support' }
    ];
    
    renderForums();
}

function renderForums() {
    const list = document.getElementById('post-list');
    list.innerHTML = '';
    
    currentPosts.forEach(post => {
        const item = document.createElement('div');
        item.className = 'post-item';
        item.innerHTML = `
            <div class="post-title">${post.title}</div>
            <div class="post-meta">by ${post.author} in ${post.category} • ${post.date}</div>
        `;
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

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadMods();
    loadForums();
});

