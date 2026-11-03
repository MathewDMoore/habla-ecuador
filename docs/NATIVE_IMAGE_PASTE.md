# Native image recognition before external beta

The first paste repair transferred copied image bytes to browser Tesseract.
Mathew's bottle photo still produced fragments. The iPhone clipboard route now
uses Vision accurate text recognition in a background queue, with English and
Spanish recognition enabled independently of the selected translation direction.
The normalized image stays on-device.

Only recognition lines with confidence >= 0.65 and a run of three or more Unicode
letters are accepted. Empty, symbol-only and weak results return an error and
keep the existing source. Excluded fragments are disclosed in the status. These
checks do not guarantee every accepted word is correct; original text remains
editable and must be reviewed. Product/brand words are not hardcoded.

The bundled script sends the native recognized text through the existing image
import callback and its stale-request guard. Current hosted code prepares the
translation automatically; its selected language pair still applies. Choose
English-to-Spanish for an English label. Ordinary Photos selection and Safari
retain their existing browser OCR route; this repair targets native image paste.

The installer applies the OCR delta relative to the already-installed paste
repair (92f1571), preserves current signing and audio/widget features, compiles
the app/widget, and opens Xcode for the physical-iPhone check.

Validation: JavaScript tests cover native recognized-text transfer, denial,
malformed/weak output, preservation of input, stale responses and cancellation.
The macOS runner extracts the exact production Vision helper and tests generated
English gold-on-blue and Spanish labels, blank images and symbol fragments.
It also accepts an optional local photo path; no user image is committed or
uploaded. CI compiles the complete combined iOS companion.

The supplied real bottle photo failed browser Tesseract in local reproduction.
Apple Vision cannot run in the Linux workspace: recognition quality for that
actual photo must still be checked on Mathew's iPhone after installing this
repair. Simulator compilation is not a physical-photo recognition test.
