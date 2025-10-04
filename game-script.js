// ========================================
// UNOFFICIAL ESPN API DISCLAIMER
// ========================================
// This application uses UNOFFICIAL ESPN API endpoints.
// These endpoints are NOT officially supported by ESPN and may
// change or become unavailable without notice.
// Use at your own risk. This is for educational purposes only.
// ========================================

const API_BASE_URL = 'https://site.api.espn.com/apis/site/v2/sports/soccer';

// DOM Elements
const loadingState = document.getElementById('loadingState');
const errorState = document.getElementById('errorState');
const errorMessage = document.getElementById('errorMessage');
const gameContent = document.getElementById('gameContent');
const gameTitle = document.getElementById('gameTitle');
const gameMeta = document.getElementById('gameMeta');
const gameScoreboard = document.getElementById('gameScoreboard');
const eventTimeline = document.getElementById('eventTimeline');
const eventsCard = document.getElementById('eventsCard');
const statsGrid = document.getElementById('statsGrid');
const statsCard = document.getElementById('statsCard');
const lineupGrid = document.getElementById('lineupGrid');
const lineupsCard = document.getElementById('lineupsCard');
const venueInfo = document.getElementById('venueInfo');
const venueCard = document.getElementById('venueCard');
const refreshBtn = document.getElementById('refreshBtn');

// Get game ID from URL
function getGameIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const gameId = getGameIdFromURL();
    
    if (!gameId) {
        showError('No game ID provided. Please select a match from the schedule.');
        return;
    }
    
    fetchGameDetails(gameId);
    setupRefreshButton(gameId);
});

// Setup refresh button
function setupRefreshButton(gameId) {
    refreshBtn.addEventListener('click', () => {
        refreshBtn.disabled = true;
        refreshBtn.style.opacity = '0.6';
        fetchGameDetails(gameId);
        setTimeout(() => {
            refreshBtn.disabled = false;
            refreshBtn.style.opacity = '1';
        }, 2000);
    });
}

// Fetch game details
async function fetchGameDetails(gameId) {
    showLoading();
    
    try {
        const summaryUrl = `${API_BASE_URL}/summary?event=${gameId}`;
        const response = await fetch(summaryUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.header) {
            throw new Error('Invalid game data received');
        }
        
        renderGameDetails(data);
        hideLoading();
        
    } catch (error) {
        console.error('Error fetching game details:', error);
        showError(error.message);
    }
}

// Show loading state
function showLoading() {
    loadingState.style.display = 'block';
    errorState.style.display = 'none';
    gameContent.style.display = 'none';
}

// Hide loading state
function hideLoading() {
    loadingState.style.display = 'none';
    gameContent.style.display = 'block';
}

// Show error state
function showError(message) {
    loadingState.style.display = 'none';
    errorState.style.display = 'block';
    gameContent.style.display = 'none';
    errorMessage.textContent = message || 'There was an error fetching the match information. Please try again.';
}

// Render game details
function renderGameDetails(data) {
    // Update page title
    const homeTeam = data.header.competitions[0].competitors.find(t => t.homeAway === 'home');
    const awayTeam = data.header.competitions[0].competitors.find(t => t.homeAway === 'away');
    
    const matchTitle = `${awayTeam.team.displayName} vs ${homeTeam.team.displayName}`;
    document.title = `${matchTitle} | Live Soccer Scores`;
    gameTitle.textContent = matchTitle;
    
    // Render meta information
    renderGameMeta(data);
    
    // Render scoreboard
    renderScoreboard(data);
    
    // Render match events
    if (data.commentary && data.commentary.length > 0) {
        renderEvents(data.commentary);
    }
    
    // Render statistics
    if (data.stats && data.stats.length > 0) {
        renderStatistics(data.stats);
    }
    
    // Render lineups
    if (data.rosters && data.rosters.length > 0) {
        renderLineups(data.rosters);
    }
    
    // Render venue information
    renderVenueInfo(data);
}

// Render game meta
function renderGameMeta(data) {
    const competition = data.header.competitions[0];
    const status = competition.status;
    const league = data.header.league;
    const venue = competition.venue;
    
    const metaItems = [];
    
    if (league) {
        metaItems.push(`${league.name}`);
    }
    
    if (status.type.description) {
        metaItems.push(status.type.description);
    }
    
    if (venue && venue.fullName) {
        metaItems.push(venue.fullName);
    }
    
    const date = new Date(data.header.competitions[0].date);
    const dateString = date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    metaItems.push(dateString);
    
    gameMeta.innerHTML = metaItems.map(item => `<span>${item}</span>`).join('');
}

// Render scoreboard
function renderScoreboard(data) {
    const competition = data.header.competitions[0];
    const homeTeam = competition.competitors.find(t => t.homeAway === 'home');
    const awayTeam = competition.competitors.find(t => t.homeAway === 'away');
    const status = competition.status;
    
    const showScore = status.type.state !== 'pre';
    
    gameScoreboard.innerHTML = `
        <div class="game-team">
            <img src="${awayTeam.team.logo}" alt="${awayTeam.team.displayName}" class="game-team-logo">
            <div class="game-team-name">${awayTeam.team.displayName}</div>
            ${awayTeam.records ? `<div class="game-team-record">${awayTeam.records[0]?.summary || ''}</div>` : ''}
        </div>
        
        ${showScore ? `
            <div style="display: flex; align-items: center; gap: 1.5rem;">
                <div class="game-score">${awayTeam.score || '0'}</div>
                <div class="game-separator">-</div>
                <div class="game-score">${homeTeam.score || '0'}</div>
            </div>
        ` : `
            <div style="font-size: 1.5rem; font-weight: 700; opacity: 0.8;">VS</div>
        `}
        
        <div class="game-team">
            <img src="${homeTeam.team.logo}" alt="${homeTeam.team.displayName}" class="game-team-logo">
            <div class="game-team-name">${homeTeam.team.displayName}</div>
            ${homeTeam.records ? `<div class="game-team-record">${homeTeam.records[0]?.summary || ''}</div>` : ''}
        </div>
    `;
}

// Render events
function renderEvents(commentary) {
    const events = commentary.filter(c => c.text && c.text.trim() !== '');
    
    if (events.length === 0) {
        return;
    }
    
    eventsCard.style.display = 'block';
    
    eventTimeline.innerHTML = events.map(event => {
        const time = event.time?.displayValue || '';
        const text = event.text || '';
        
        return `
            <div class="timeline-item">
                ${time ? `<div class="timeline-time">${time}'</div>` : ''}
                <div class="timeline-content">
                    <div class="timeline-description">${text}</div>
                </div>
            </div>
        `;
    }).join('');
}

// Render statistics
function renderStatistics(stats) {
    const homeStats = stats.find(s => s.name === 'home')?.stats || [];
    const awayStats = stats.find(s => s.name === 'away')?.stats || [];
    
    if (homeStats.length === 0 && awayStats.length === 0) {
        return;
    }
    
    statsCard.style.display = 'block';
    
    // Create a map of stats by name
    const statMap = new Map();
    
    homeStats.forEach(stat => {
        statMap.set(stat.name, { home: stat.displayValue, away: null, label: stat.label });
    });
    
    awayStats.forEach(stat => {
        if (statMap.has(stat.name)) {
            statMap.get(stat.name).away = stat.displayValue;
        } else {
            statMap.set(stat.name, { home: null, away: stat.displayValue, label: stat.label });
        }
    });
    
    statsGrid.innerHTML = Array.from(statMap.entries()).map(([name, data]) => {
        const homeValue = parseFloat(data.home) || 0;
        const awayValue = parseFloat(data.away) || 0;
        const total = homeValue + awayValue;
        const homePercentage = total > 0 ? (homeValue / total) * 100 : 50;
        
        return `
            <div class="stat-row">
                <div class="stat-values">
                    <span class="stat-value">${data.home || '0'}</span>
                </div>
                <div style="flex: 1; text-align: center;">
                    <div class="stat-label">${data.label || name}</div>
                    <div class="stat-bar">
                        <div class="stat-bar-fill" style="width: ${homePercentage}%;"></div>
                    </div>
                </div>
                <div class="stat-values">
                    <span class="stat-value">${data.away || '0'}</span>
                </div>
            </div>
        `;
    }).join('');
}

// Render lineups
function renderLineups(rosters) {
    if (rosters.length === 0) {
        return;
    }
    
    lineupsCard.style.display = 'block';
    
    lineupGrid.innerHTML = rosters.map(roster => {
        const teamName = roster.team?.displayName || 'Team';
        const players = roster.roster || [];
        
        // Filter starting lineup
        const starters = players.filter(p => p.starter === true);
        
        if (starters.length === 0) {
            return `
                <div class="lineup-team">
                    <h3>${teamName}</h3>
                    <p style="color: var(--text-secondary); font-size: 0.875rem;">Lineup not available</p>
                </div>
            `;
        }
        
        return `
            <div class="lineup-team">
                <h3>${teamName}</h3>
                <div class="player-list">
                    ${starters.map(player => `
                        <div class="player-item">
                            <div class="player-number">${player.jersey || '-'}</div>
                            <div class="player-info">
                                <div class="player-name">${player.athlete?.displayName || 'Unknown'}</div>
                                <div class="player-position">${player.position?.abbreviation || player.position?.name || ''}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }).join('');
}

// Render venue information
function renderVenueInfo(data) {
    const competition = data.header.competitions[0];
    const venue = competition.venue;
    const broadcasts = competition.broadcasts || [];
    const officials = data.gameInfo?.officials || [];
    const attendance = data.gameInfo?.attendance;
    
    const infoItems = [];
    
    if (venue) {
        if (venue.fullName) {
            infoItems.push({
                icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 10C11.1 10 12 9.1 12 8C12 6.9 11.1 6 10 6C8.9 6 8 6.9 8 8C8 9.1 8.9 10 10 10Z" fill="currentColor"/>
                    <path d="M10 2C6.7 2 4 4.7 4 8C4 12 10 18 10 18C10 18 16 12 16 8C16 4.7 13.3 2 10 2Z" stroke="currentColor" stroke-width="1.5" fill="none"/>
                </svg>`,
                label: 'Venue',
                value: venue.fullName
            });
        }
        
        if (venue.address && venue.address.city) {
            const location = [venue.address.city, venue.address.country].filter(Boolean).join(', ');
            if (location) {
                infoItems.push({
                    icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="1.5" fill="none"/>
                        <path d="M10 2C10 2 6 6 6 10C6 14 10 18 10 18" stroke="currentColor" stroke-width="1.5"/>
                        <path d="M10 2C10 2 14 6 14 10C14 14 10 18 10 18" stroke="currentColor" stroke-width="1.5"/>
                        <line x1="2" y1="10" x2="18" y2="10" stroke="currentColor" stroke-width="1.5"/>
                    </svg>`,
                    label: 'Location',
                    value: location
                });
            }
        }
        
        if (venue.capacity) {
            infoItems.push({
                icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="10" cy="7" r="3" stroke="currentColor" stroke-width="1.5" fill="none"/>
                    <path d="M4 18C4 14 6.5 12 10 12C13.5 12 16 14 16 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>`,
                label: 'Capacity',
                value: venue.capacity.toLocaleString()
            });
        }
    }
    
    if (attendance) {
        infoItems.push({
            icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="7" cy="6" r="2" stroke="currentColor" stroke-width="1.5" fill="none"/>
                <circle cx="13" cy="6" r="2" stroke="currentColor" stroke-width="1.5" fill="none"/>
                <path d="M3 16C3 13.5 4.5 12 7 12C9.5 12 11 13.5 11 16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                <path d="M9 16C9 13.5 10.5 12 13 12C15.5 12 17 13.5 17 16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>`,
            label: 'Attendance',
            value: attendance.toLocaleString()
        });
    }
    
    if (broadcasts.length > 0) {
        const broadcastNames = broadcasts.map(b => b.names?.[0]).filter(Boolean).join(', ');
        if (broadcastNames) {
            infoItems.push({
                icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="2" y="4" width="16" height="10" rx="1" stroke="currentColor" stroke-width="1.5" fill="none"/>
                    <path d="M6 14L6 17L14 17L14 14" stroke="currentColor" stroke-width="1.5"/>
                    <line x1="10" y1="17" x2="10" y2="18" stroke="currentColor" stroke-width="1.5"/>
                </svg>`,
                label: 'Broadcast',
                value: broadcastNames
            });
        }
    }
    
    if (officials.length > 0) {
        const referee = officials.find(o => o.position?.name === 'Referee' || o.order === 1);
        if (referee && referee.official?.fullName) {
            infoItems.push({
                icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="10" cy="6" r="3" stroke="currentColor" stroke-width="1.5" fill="none"/>
                    <path d="M5 18C5 14.5 7 13 10 13C13 13 15 14.5 15 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>`,
                label: 'Referee',
                value: referee.official.fullName
            });
        }
    }
    
    const weather = data.gameInfo?.weather;
    if (weather) {
        const weatherDetails = [];
        if (weather.displayValue) weatherDetails.push(weather.displayValue);
        if (weather.temperature) weatherDetails.push(`${weather.temperature}°F`);
        
        if (weatherDetails.length > 0) {
            infoItems.push({
                icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="10" cy="10" r="4" stroke="currentColor" stroke-width="1.5" fill="none"/>
                    <line x1="10" y1="2" x2="10" y2="4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                    <line x1="10" y1="16" x2="10" y2="18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                    <line x1="18" y1="10" x2="16" y2="10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                    <line x1="4" y1="10" x2="2" y2="10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>`,
                label: 'Weather',
                value: weatherDetails.join(', ')
            });
        }
    }
    
    if (infoItems.length === 0) {
        return;
    }
    
    venueCard.style.display = 'block';
    
    venueInfo.innerHTML = `
        <div style="display: grid; gap: 1rem;">
            ${infoItems.map(item => `
                <div style="display: flex; align-items: flex-start; gap: 1rem; padding: 0.75rem; background-color: var(--bg-secondary); border-radius: 0.5rem;">
                    <div style="color: var(--primary-color); flex-shrink: 0; margin-top: 0.125rem;">
                        ${item.icon}
                    </div>
                    <div style="flex: 1;">
                        <div style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 600; margin-bottom: 0.25rem; letter-spacing: 0.05em;">
                            ${item.label}
                        </div>
                        <div style="font-size: 0.9375rem; color: var(--text-primary); font-weight: 500;">
                            ${item.value}
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}
