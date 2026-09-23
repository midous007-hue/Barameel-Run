# BARAMEEL RUN

A self-contained GitHub-ready prototype for the BARAMEEL RUN game flow.

## Core rules implemented

- No account, login, registration, profile, or personal data.
- Player chooses a runner locally on the device.
- A real-world checkpoint QR is the entry point to the run.
- One fixed checkpoint reward per 24-hour cycle.
- No map and no GPS/location tracking in this MVP.
- Successful scan → reward → destination screen → Points/Marks → checkout/redeem flow.
- Repeated scan before 24 hours shows **ALREADY COLLECTED** with a countdown.
- State is stored locally with `localStorage` for the prototype.
- A technical anonymous local state is enough for this demo; no user registration exists.

## Screens

1. Start
2. Choose Character
3. Character Confirm
4. Home
5. Scan QR
6. Checkpoint Found
7. Reward Collected
8. Go to Location
9. Points & Marks
10. Use at Checkout
11. Redemption / Already Collected state
12. How It Works

## Characters

The runner selection uses six illustrated runner assets. The selected runner is persisted locally and shown in confirmation/home overlays.

## Audio

Included local WAV game SFX:

- `select.wav`
- `click.wav`
- `scan.wav`
- `reward.wav`
- `error.wav`
- `whoosh.wav`
- `run-ambient-loop.wav`

The prototype also uses browser speech synthesis for short BARAMEEL RUN confirmation callouts; it does not require an external API.

## QR demo

`assets/barameel-run-checkpoint-001.png` contains a QR payload beginning with `BARAMEEL-RUN`. On supported browsers, the scan screen can use the device camera and native `BarcodeDetector`; the **DEMO SCAN** control is included as a fallback for desktop/testing.

## Run

Open `index.html` locally for the UI. For camera QR scanning, deploy through HTTPS (GitHub Pages is suitable).

No external libraries or CDN dependencies are required.

## Navigation notes

- Start → Choose Runner → Confirm → Home.
- Home → Scan opens the camera scanner.
- Successful scan → Checkpoint Found → Reward Collected → Walk-to-destination → Points & Marks → Use at Checkout → Redemption Code.
- A second scan during the 24-hour cooldown → Already Collected.
- The destination button opens walking directions to a configurable BARAMEEL Alexandria search destination; edit the URL in `js/app.js` when the exact branch coordinates are finalized.

## Visual source package

The `assets/screens` images are cropped from the approved BARAMEEL RUN storyboard artwork supplied in the project, and the character/logo masters are included in `assets/` for future refinement.
