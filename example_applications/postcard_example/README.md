# Example Postkard Application

To run this, install dependencies in the root of the repository with a `npm install`
and then navigate to this folder and run `npm run build` to build the dist files
(which are not checked in).  Then, you should be able to open index.html in the dist
foder from your favorite browser.

Or you could put it up on a server and have the hottest postcard startup ever.

This form exercises a custom theme, and simple navigation from view to view.  If
you want to use this for a real application, it's highly recommended to use a real
router.

## Hat Trick

Thrown in are a couple of configuration-only views in the `views/` folder, to show
how you can also use configuration to display basic content or other html templates.

By leveraging some of the more rich `{~Entity:` and such jellyfish templates, these
configuration-only views can be fairly capable (not just static HTML content).
