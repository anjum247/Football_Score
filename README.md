# ⚽ Live Soccer Scoreboard & Schedule

A modern, SEO-optimized, and fully responsive web application for tracking live soccer matches, scores, schedules, and detailed match statistics. Built with vanilla JavaScript and designed for educational purposes.

![Live Soccer Scoreboard](https://img.shields.io/badge/Status-Active-success)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

## 🌟 Features

### Homepage (Schedule View)
- **📅 Today's Match Schedule** - View all soccer matches happening today
- **🏆 League Grouping** - Matches organized by league/competition with logos
- **⚡ Live Match Indicators** - Real-time pulsing glow animation for ongoing matches
- **💰 Match Odds Display** - Shows betting odds (Home/Draw/Away) when available
- **🔄 Auto-Refresh** - Manual refresh button to get latest scores
- **📱 Fully Responsive** - Works seamlessly on mobile, tablet, and desktop
- **🎨 Modern UI/UX** - Clean design with smooth animations and transitions

### Detail Page (Match Summary)
- **📊 Live Scoreboard** - Real-time score updates with team logos
- **⏱️ Match Events Timeline** - Goals, cards, substitutions with timestamps
- **📈 Match Statistics** - Visual stat bars (possession, shots, passes, etc.)
- **👥 Starting Lineups** - Complete team formations with player names and positions
- **🏟️ Venue Information** - Stadium details, attendance, referee, weather, broadcast info

### SEO Optimized
- ✅ Semantic HTML with proper heading hierarchy (H1, H2, H3)
- ✅ High-intent meta titles and descriptions
- ✅ Open Graph and Twitter Card meta tags
- ✅ Fast loading with minimal dependencies
- ✅ Mobile-first responsive design

## 🚀 Demo

[**Live Demo**](#) _(Add your live demo link here)_

## 📸 Screenshots

### Homepage - Schedule View
![Homepage Screenshot](https://via.placeholder.com/800x450/1a5f3f/ffffff?text=Homepage+Screenshot)

### Match Detail Page
![Detail Page Screenshot](https://via.placeholder.com/800x450/1a5f3f/ffffff?text=Detail+Page+Screenshot)

## 🛠️ Tech Stack

- **HTML5** - Semantic markup with SEO best practices
- **CSS3** - Modern styling with CSS Grid, Flexbox, and custom animations
- **Vanilla JavaScript** - No frameworks, pure ES6+ JavaScript
- **ESPN API** - Unofficial API endpoints for match data _(see disclaimer below)_

## 📁 Project Structure

```
soccer-scoreboard/
│
├── index.html          # Homepage (Schedule View)
├── game.html           # Detail Page (Match Summary)
├── style.css           # Global styles for all pages
├── script.js           # Homepage JavaScript
├── game-script.js      # Detail Page JavaScript
└── README.md           # Project documentation
```

## 🏃 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/soccer-scoreboard.git
cd soccer-scoreboard
```

### 2. Open in Browser

Simply open `index.html` in your web browser:

```bash
# Using Python
python -m http.server 8000

# Using Node.js (http-server)
npx http-server

# Or just double-click index.html
```

### 3. View the Application

Navigate to `http://localhost:8000` (or wherever your local server is running)

## 🔧 Configuration

### API Endpoints

The application uses the following ESPN API endpoints:

```javascript
// Homepage Schedule
https://site.api.espn.com/apis/site/v2/sports/soccer/scoreboard

// Match Detail
https://site.api.espn.com/apis/site/v2/sports/soccer/summary?event={gameId}
```

## ⚠️ Important Disclaimer

**This project uses UNOFFICIAL ESPN API endpoints.**

- These endpoints are **NOT** officially supported by ESPN
- They may change or become unavailable without notice
- This project is for **educational and demonstration purposes only**
- ESPN® is a registered trademark
- This project is **not affiliated with, endorsed by, or connected to ESPN**

**Use at your own risk.** For production applications, please use official APIs with proper authentication and rate limiting.

## 🎨 Customization

### Change Colors

Edit the CSS variables in `style.css`:

```css
:root {
    --primary-color: #1a5f3f;        /* Main brand color */
    --accent-color: #4ade80;          /* Accent highlights */
    --live-color: #ef4444;            /* Live match indicator */
}
```

### Modify Layout

The application uses CSS Grid and Flexbox for layouts. All responsive breakpoints are in `style.css`:

```css
@media (max-width: 768px) {
    /* Tablet styles */
}

@media (max-width: 480px) {
    /* Mobile styles */
}
```

## 📱 Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 🐛 Known Issues

- API rate limiting may occur with frequent refreshes
- Some older matches may not have complete statistics
- Odds data is not available for all matches
- API endpoints may occasionally be unavailable

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Steps to Contribute:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Contribution Ideas:

- [ ] Add support for multiple sports (basketball, tennis, etc.)
- [ ] Implement date picker to view past/future matches
- [ ] Add favorite teams feature with localStorage
- [ ] Create dark mode theme toggle
- [ ] Add match predictions and analytics
- [ ] Implement progressive web app (PWA) features
- [ ] Add unit tests with Jest
- [ ] Create CI/CD pipeline

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 [Your Name]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/yourprofile)
- Twitter: [@yourhandle](https://twitter.com/yourhandle)

## 🙏 Acknowledgments

- ESPN for providing publicly accessible API endpoints
- [Inter Font](https://fonts.google.com/specimen/Inter) by Rasmus Andersson
- Inspiration from modern sports websites like ESPN, BBC Sport, and LiveScore

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/soccer-scoreboard/issues) page
2. Open a new issue with detailed information
3. Contact me via email: your.email@example.com

## 🗺️ Roadmap

### Version 2.0 (Planned)
- [ ] User authentication system
- [ ] Match notifications and alerts
- [ ] Historical data and archives
- [ ] Advanced filtering and search
- [ ] Multi-language support
- [ ] Share match details on social media
- [ ] Embed widget for other websites

### Version 3.0 (Future)
- [ ] Mobile app (React Native)
- [ ] Backend API with database
- [ ] Real-time WebSocket updates
- [ ] Machine learning predictions
- [ ] Fantasy football integration

## ⭐ Star History

If you find this project helpful, please consider giving it a star ⭐

[![Star History Chart](https://api.star-history.com/svg?repos=yourusername/soccer-scoreboard&type=Date)](https://star-history.com/#yourusername/soccer-scoreboard&Date)

---

**Made with ⚽ and ❤️ for football fans worldwide**

*Last Updated: October 2025*
