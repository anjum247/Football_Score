// ========================================
// UNOFFICIAL ESPN API DISCLAIMER
// ========================================
// This application uses UNOFFICIAL ESPN API endpoints.
// These endpoints are NOT officially supported by ESPN and may
// change or become unavailable without notice.
// Use at your own risk. This is for educational purposes only.
// ========================================

const API_BASE_URL = 'https://site.api.espn.com/apis/site/v2/sports/soccer';
const SCOREBOARD_ENDPOINT = `${API_BASE_URL}/scoreboard`;

// DOM Elements
const scheduleContainer = document.getElementById('scheduleContainer');
const loadingState = document.getElementById('loadingState');
const errorState = document.getElementById('errorState');
const noMatchesState = document.getElementById('noMatchesState');
const lastUpdated = document.getElementById('lastUpdated');
const refreshBtn = document.getElementById('refreshBtn');
const errorMessage = document.getElementById('errorMessage');

// State
let matchesData = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchSchedule();
    setupRefreshButton();
});

// Setup refresh button
function setupRefreshButton() {
    refreshBtn.addEventListener('click', () => {
        refreshBtn.disabled = true;
        refreshBtn.style.opacity = '0.6';
        fetchSchedule();
        setTimeout(() => {
            refreshBtn.disabled = false;
            refreshBtn.style.opacity = '1';
        }, 2000);
    });
}

// Fetch schedule data
async function fetchSchedule() {
    showLoading();
    
    try {
        const response = await fetch(SCOREBOARD_ENDPOINT);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        matchesData = data;
        
        if (!data.events || data.events.length === 0) {
            showNoMatches();
            return;
        }
        
        renderSchedule(data);
        updateLastUpdatedTime();
        hideLoading();
        
    } catch (error) {
        console.error('Error fetching schedule:', error);
        showError(error.message);
    }
}

// Show loading state
function showLoading() {
    loadingState.style.display = 'block';
    errorState.style.display = 'none';
    noMatchesState.style.display = 'none';
    scheduleContainer.style.display = 'none';
}

// Hide loading state
function hideLoading() {
    loadingState.style.display = 'none';
    scheduleContainer.style.display = 'block';
}

// Show error state
function showError(message) {
    loadingState.style.display = 'none';
    errorState.style.display = 'block';
    errorMessage.textContent = message || 'There was an error fetching the schedule. Please try again.';
}

// Show no matches state
function showNoMatches() {
    loadingState.style.display = 'none';
    noMatchesState.style.display = 'block';
}

// Update last updated time
function updateLastUpdatedTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
    });
    lastUpdated.textContent = `Last updated: ${timeString}`;
}

// Group matches by league
function groupMatchesByLeague(events) {
    const grouped = {};
    
    events.forEach(event => {
        const leagueId = event.competitions[0]?.league?.id || 'unknown';
        
        if (!grouped[leagueId]) {
            grouped[leagueId] = {
                league: event.competitions[0]?.league || {},
                matches: []
            };
        }
        
        grouped[leagueId].matches.push(event);
    });
    
    return Object.values(grouped);
}

// Render schedule
function renderSchedule(data) {
    const groupedMatches = groupMatchesByLeague(data.events);
    scheduleContainer.innerHTML = '';
    
    groupedMatches.forEach(group => {
        const section = createLeagueSection(group);
        scheduleContainer.appendChild(section);
    });
}

// Create league section
function createLeagueSection(group) {
    const section = document.createElement('section');
    section.className = 'league-section';
    
    const header = document.createElement('div');
    header.className = 'league-header';
    
    const leagueName = group.league.name || 'Unknown League';
    const leagueLogo = group.league.logos?.[0]?.href || '';
    const matchCount = group.matches.length;
    
    header.innerHTML = `
        ${leagueLogo ? `<img src="${leagueLogo}" alt="${leagueName}" class="league-logo">` : ''}
        <div class="league-info">
            <h2>${leagueName}</h2>
            <p>${group.league.abbreviation || ''}</p>
        </div>
        <span class="match-count">${matchCount} ${matchCount === 1 ? 'match' : 'matches'}</span>
    `;
    
    section.appendChild(header);
    
    const matchesGrid = document.createElement('div');
    matchesGrid.className = 'matches-grid';
    
    group.matches.forEach(match => {
        const card = createMatchCard(match);
        matchesGrid.appendChild(card);
    });
    
    section.appendChild(matchesGrid);
    
    return section;
}

// Create match card
function createMatchCard(match) {
    const card = document.createElement('article');
    card.className = 'match-card';
    
    const competition = match.competitions[0];
    const status = competition.status;
    const isLive = status.type.state === 'in';
    
    if (isLive) {
        card.classList.add('live');
    }
    
    // Make card clickable
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => {
        window.location.href = `game.html?id=${match.id}`;
    });
    
    // Status and time
    const statusBadge = getStatusBadge(status);
    const matchTime = getMatchTime(match);
    
    // Teams
    const homeTeam = competition.competitors.find(t => t.homeAway === 'home');
    const awayTeam = competition.competitors.find(t => t.homeAway === 'away');
    
    card.innerHTML = `
        <div class="match-status">
            ${statusBadge}
            <span class="match-time">${matchTime}</span>
        </div>
        
        <div class="teams-container">
            ${createTeamHTML(homeTeam, status)}
            ${createTeamHTML(awayTeam, status)}
        </div>
        
        ${createMatchDetailsHTML(competition)}
        ${createOddsHTML(competition)}
    `;
    
    return card;
}

// Get status badge
function getStatusBadge(status) {
    const state = status.type.state;
    const displayClock = status.displayClock || '';
    
    if (state === 'pre') {
        return `<span class="status-badge pre">Scheduled</span>`;
    } else if (state === 'in') {
        return `
            <span class="status-badge live">
                <span class="live-indicator"></span>
                Live ${displayClock}
            </span>
        `;
    } else {
        return `<span class="status-badge post">Final</span>`;
    }
}

// Get match time
function getMatchTime(match) {
    const date = new Date(match.date);
    const now = new Date();
    const status = match.competitions[0].status;
    
    if (status.type.state === 'in') {
        return status.type.detail || 'In Progress';
    } else if (status.type.state === 'post') {
        return 'Full Time';
    } else {
        const timeString = date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
        
        const isToday = date.toDateString() === now.toDateString();
        
        if (isToday) {
            return timeString;
        } else {
            const dateString = date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });
            return `${dateString}, ${timeString}`;
        }
    }
}

// Create team HTML
function createTeamHTML(team, status) {
    const score = team.score || '0';
    const showScore = status.type.state !== 'pre';
    
    return `
        <div class="team">
            <div class="team-info">
                <img src="${team.team.logo}" alt="${team.team.displayName}" class="team-logo">
                <span class="team-name">${team.team.displayName}</span>
            </div>
            ${showScore ? `<span class="team-score">${score}</span>` : ''}
        </div>
    `;
}

// Create match details HTML
function createMatchDetailsHTML(competition) {
    const venue = competition.venue?.fullName || '';
    const broadcast = competition.broadcasts?.[0]?.names?.[0] || '';
    
    if (!venue && !broadcast) {
        return '';
    }
    
    return `
        <div class="match-details">
            ${venue ? `
                <div class="detail-item">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 8C9.1 8 10 7.1 10 6C10 4.9 9.1 4 8 4C6.9 4 6 4.9 6 6C6 7.1 6.9 8 8 8Z" fill="currentColor"/>
                        <path d="M8 1C5.2 1 3 3.2 3 6C3 9.5 8 15 8 15C8 15 13 9.5 13 6C13 3.2 10.8 1 8 1Z" stroke="currentColor" stroke-width="1.5" fill="none"/>
                    </svg>
                    ${venue}
                </div>
            ` : ''}
            ${broadcast ? `
                <div class="detail-item">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="2" y="3" width="12" height="8" rx="1" stroke="currentColor" stroke-width="1.5" fill="none"/>
                        <path d="M5 11L5 13L11 13L11 11" stroke="currentColor" stroke-width="1.5"/>
                        <line x1="8" y1="13" x2="8" y2="14" stroke="currentColor" stroke-width="1.5"/>
                    </svg>
                    ${broadcast}
                </div>
            ` : ''}
        </div>
    `;
}

// Create odds HTML
function createOddsHTML(competition) {
    const odds = competition.odds;
    
    if (!odds || !odds.length) {
        return '';
    }
    
    const primaryOdds = odds[0];
    const homeOdds = primaryOdds.homeTeamOdds;
    const awayOdds = primaryOdds.awayTeamOdds;
    const drawOdds = primaryOdds.drawOdds;
    
    if (!homeOdds && !awayOdds && !drawOdds) {
        return '';
    }
    
    return `
        <div class="odds-section">
            <div class="odds-title">Match Odds</div>
            <div class="odds-container">
                ${homeOdds ? `
                    <div class="odd-item">
                        <div class="odd-label">Home</div>
                        <div class="odd-value">${formatOdds(homeOdds.moneyLine)}</div>
                    </div>
                ` : ''}
                ${drawOdds ? `
                    <div class="odd-item">
                        <div class="odd-label">Draw</div>
                        <div class="odd-value">${formatOdds(drawOdds.moneyLine)}</div>
                    </div>
                ` : ''}
                ${awayOdds ? `
                    <div class="odd-item">
                        <div class="odd-label">Away</div>
                        <div class="odd-value">${formatOdds(awayOdds.moneyLine)}</div>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

// Format odds
function formatOdds(value) {
    if (!value) return 'N/A';
    return value > 0 ? `+${value}` : value.toString();
}
