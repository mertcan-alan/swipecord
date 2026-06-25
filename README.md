# Swipecord ⚡️

<div align="center">
  <img src="assets/swipecord.gif" alt="Swipecord" width="120" height="120">
  <p><strong>Tinder-style swipe management for Discord servers.</strong></p>
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
  [![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)]()
  [![Language](https://img.shields.io/badge/Language-JavaScript%20(Electron)-yellow.svg)]()
</div>

<br>

Swipecord is a premium, macOS-inspired desktop application built with Electron that turns the tedious task of cleaning up your Discord server list into an engaging, Tinder-like swiping experience. 

Read this in other languages: [Türkçe](README.tr.md)

---

## ✨ Features

- **Tinder-like Swiping:** Swipe left to leave a server, swipe right to keep it.
- **Batch Processing:** All your swipes are queued. Review your choices and apply them all at once when you're done.
- **Undo System:** Made a mistake? Press `Undo` or `Ctrl+Z` to revert your last swipe.
- **Owner Protection:** Prevents you from accidentally leaving servers you own.
- **Premium UI/UX:** Frosted glass aesthetics, smooth physics-based animations, and macOS traffic-light window controls.
- **Keyboard Shortcuts:** Full keyboard support for rapid sorting (Arrows, A/D, Ctrl+Z).
- **100% Local & Secure:** Your Discord token never leaves your machine. See our [Privacy Policy](PRIVACY_POLICY.md).

## 🚀 Installation & Usage

1. **Clone the repository:**
   ```bash
   git clone https://github.com/mertcan-alan/swipecord.git
   cd swipecord
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the application:**
   ```bash
   npm start
   ```

## 🔑 How to get your Discord Token

*Note: Swipecord is intended for personal, local use. Never share your token with anyone.*

1. Open Discord in your web browser or the desktop app.
2. Press `Ctrl + Shift + I` (or `F12`) to open Developer Tools.
3. Go to the **Network** tab.
4. Click on any channel or server to generate network traffic.
5. Search for `science` or `messages` in the network requests.
6. Click on a request, go to the **Headers** tab, and scroll down to **Request Headers**.
7. Find the `Authorization` header. That value is your token.

## ⌨️ Shortcuts

| Action | Keybinding |
| :--- | :--- |
| **Leave Server** | `Swipe Left` / `Left Arrow` / `A` |
| **Keep Server** | `Swipe Right` / `Right Arrow` / `D` |
| **Undo** | `Undo Button` / `Ctrl + Z` |

## 🛡️ Security & Privacy

Swipecord uses standard Electron security practices. `nodeIntegration` is disabled in the renderer, and `contextIsolation` is enforced. Your Discord token is only stored in memory during runtime and is **never** saved to disk or sent to any third-party servers.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](https://en.wikipedia.org/wiki/MIT_License) file for details.
