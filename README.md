# A little birthday escape

A full-screen birthday journey through four supplied landscapes. Plain HTML, CSS, and JavaScript; no build step or dependencies.

## Preview

Open `index.html` in a browser, or run this in the project directory:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Then visit http://localhost:8000.

## Make it yours

Edit `content.js` to change her name, the letter, signoff, and the three things you love about her. The current message is a suggested romantic draft, not a record of personal memories. Her birthday, 18 September, appears in `index.html`; no age is assumed. Static fallback names and the page title in `index.html` can also be updated for consistency before JavaScript loads.

The experience includes a letter with page controls, three little notes, an interactive birthday candle with a petal celebration, and optional original music-box audio. Sound starts only when requested and pauses when the page is hidden. Fonts use Google Fonts when available, with system fallbacks; everything else is local.

## Landscape animation

Scroll down to zoom from the sky into the valley (`ChatGPT Image Sep 14, 2026, 11_16_06 PM.png`), then keep scrolling to move into the village street (`ChatGPT Image Sep 14, 2026, 11_31_23 PM.png`), where the envelope appears. Scroll upward to reverse the journey. The artwork and text stay fixed in the viewport; no sections slide up or down. Click the envelope to read the letter over the street. The little notes and candle open from the same scene.

Continue past the letter scene for a final zoom into the sunset (`ChatGPT Image Sep 15, 2026, 12_02_32 AM.png`). The closing message sits above the couple, with another way to open the birthday candle. The sunset transition uses a warmer mist and less daylight shading. All four stops can be revisited by scrolling backward.

Mouse wheels, trackpads, touch swipes, and normal keyboard scrolling all drive the same continuous camera timeline. Stopping partway leaves the camera there after a short easing settles. The scene prompts and left/right arrow keys are optional shortcuts. There is no bottom navigation, Back button, or Motion toggle; the sound control remains. Dialogs lock the background journey; long text inside a dialog can still scroll on small screens. The letter and notes also have page controls.

`motion.css` and `motion.js` contain the layout and scroll-driven zooms. A 550svh invisible scroll track supplies native scroll input while the experience remains fixed, preserving the same scrolling distance for each zoom. The browser’s wheel/touch behavior is not intercepted. The camera eases toward the scroll position, with soft focus and a light mist during each blend. Incoming images are decoded before their transition is allowed; a failed image keeps the earlier scene visible and offers a refresh instruction. The frame loop stops when settled or the tab is hidden. The device’s reduced-motion preference switches scenes without zooming while retaining scroll navigation and all content. The four still images are separate illustrations, so the transitions are art-directed rather than exact geometric matches. No reference-site assets are included.

## Share

Upload `index.html`, `style.css`, `motion.css`, `script.js`, `motion.js`, `content.js`, the `assets` folder, and all four supplied landscape PNGs together to any static website host. Keep the image filenames unchanged. This site has no form, analytics, or backend. Anything published, including the letter, is readable by anyone with access to the site.
