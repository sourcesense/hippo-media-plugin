::Goals::
Support for media assets to the Hippo WYSIWYG Editor (Xinha)
Support for most common proprietary multimedia format(i.e. wma, quicktime, realAudio)
Capability to identify and handle the insertion of the media type in the appropriate way, depending on the resource type.
Support for mainstream Internet video services: youtube.com, vimeo.com etc.

::Requirements:
Provide a transparent way to switch to Flash-based player in order to serve FLV, H.264, MP4, MP3, AAC, JPG, PNG and GIF resources.
*Use of an OpenSource player
*Customization (skinning, logo, playback controls)
*Playlist feature
Example(not using JWplayer):
Using a Quicktime movie as a source, the plugin should render the following XHTML code:
<OBJECT DATA="mlk.mov" TYPE="video/quicktime" TITLE="Martin Luther King's "I Have a Dream" speech" WIDTH=150 HEIGHT=150>
<PARAM NAME=pluginspage VALUE="http://quicktime.apple.com/">
<PARAM NAME=autoplay VALUE=true>
<OBJECT DATA="mlk.mp3" TYPE="audio/mpeg" TITLE="Martin Luther King's "I Have a Dream" speech">
<PARAM NAME=autostart VALUE=true>
<PARAM NAME=hidden VALUE=true>
<A HREF="mlk.html">Full text of Martin Luther King's "I Have a Dream" speech</A>
</OBJECT>

::Implementation::
The Hippo Media Plugin consists of;
*a Xinha toolbar button that will allow editors to inject media assets into a rich text editor
*Hippo HTML Cleaner configuration which allows <object> items to be rendered on the frontend side; read more on how to configure the Rich-text fields
*JW Player - the de facto standard Open Source Media Player

From the root folder:
> mvn clean install
> cd hippo-media-plugin-cms
> mvn jetty:run-war

Apache Maven 2.x is required (version 2.2.1 is advised)
