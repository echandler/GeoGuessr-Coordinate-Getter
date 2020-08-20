# GeoGuessr-Coordinate-Getter
Retrieve the marker coordinates on GeoGuessr.

### How to use:
* Install greasemonkey or tampermonkey.
* Create a new script and delete the default contents.
* Copy everything in src.user.js to the new script and then save the script.
* Reload the GeoGuessr website.

### Instructions:

* A menu will popup if you hold the SHIFT key and place the cursor over a marker.
* Click which ever button you want — the coordinates will be copied to the clipboard automatically in csv form.

### Further instruction for ZeeMaps:
* Select "Additions".
* Select "Upload (Copy-Paste) Spreadsheet".
* Select the "Copy-and-Paste" tab.
* Delete everything in the text area and paste the coordinates from the clipboard into the text area.
* Click the "Submit" button.
* Select the "Advanced" Tab.
* Change "Lattitude" to "Column A" and "Longitude" to "Column B".
* Select a color for the markers.
* Currently a default country has to be selected for some reason.
* Click the "Submit" button. 

Disclaimer: The code depends on the GeoGuessr source code, which I have no control over, so if the Geoguessr code changes it could break this script. If it stops working for some reason check back and see if the code has been updated.
