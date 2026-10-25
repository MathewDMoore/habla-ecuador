# Visible translation Copy — build 131

The iPhone recording showed the translated draft and Text options, but Copy was folded into the signed companion's closed Playback & translation notes disclosure. Select all selected the contenteditable draft without providing a dependable copy action.

Copy now lives beside the visible translation's Expand and Text options controls in both app pages. Hosted binding recovers its existing toolbar, a dedicated status and manual-copy fallback after the companion's legacy result-layout transformation. The same editable draft and Copy node are retained, including when the companion shares the workspace between Translate and Music. No Swift/signing change is required.

The button copies the current completed visible translation, including edits, paragraph breaks and Unicode; it excludes source text and metadata. It tries the Clipboard API, then a temporary selected readonly textarea with the browser's legacy copy command. Temporary selection is cleaned up and the prior focus/selection is restored. Only successful APIs report copied. If both routes are blocked, the app displays the exact translation in a visible readonly selectable field with a direct retry button. A new translation or changed draft clears a stale manual-copy snapshot. Pending duplicate clicks are suppressed, and completion after a changed translation tells the user to copy the current text again.

No automatic copying, message sending, server endpoint, audio upload or new persisted user-text copy is introduced. Existing Share remains independent. Translated interface strings are included for copy status and fallback instructions.

## Validation

All 32 JavaScript suites pass locally. The new browser regression covers 320/390px, the app and standalone pages, and a layout fixture reproducing the observed companion-16 disclosure/workspace behavior. It tests visible Copy without opening notes, modern and legacy success, blocked APIs, selected manual text, direct retry, source exclusion, edited paragraphs/Unicode, duplicate taps, late completion, stale snapshot cleanup, workspace navigation and unchanged draft identity/content. Clipboard boundaries are mocked; this does not establish actual OS clipboard behavior on a physical iPhone. Chromium and WebKit CI run this regression alongside the existing practice/lesson checks.
