// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

const { ipcRenderer } = require('electron')

;(async () => {
  window.addEventListener('DOMContentLoaded', () => {
    startCountdown()
  })

  function startCountdown() {
    const countdownElement = document.querySelector('.time')

    ipcRenderer.on('update-countdown', (event, countdown) => {
      countdownElement.textContent = countdown
    })
  }

  // function doAThing() {
  //   const versions = window.electron.process.versions
  //   replaceText('.electron-version', `Electron v${versions.electron}`)
  //   replaceText('.chrome-version', `Chromium v${versions.chrome}`)
  //   replaceText('.node-version', `Node v${versions.node}`)
  //   replaceText('.v8-version', `V8 v${versions.v8}`)
  // }

  // function replaceText(selector, text) {
  //   const element = document.querySelector(selector)
  //   if (element) {
  //     element.innerText = text
  //   }
  // }
})()
