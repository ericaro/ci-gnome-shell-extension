# CI gnome shell extension

This is a small, simple extension to display a CI daemon status.

## Usage

 - green smiling emoticon: CI is ok
 - red sad emoticon: CI has errors
 - zzz smiley: protocol error: outgoing (`->`) , or incoming( `<-`), or json (`{}` 

## Configuration 

change CI server address:

      dconf write /org/gnome/shell/extensions/ci/url "'http://localhost:8080/status'"

change period between refresh

      dconf write /org/gnome/shell/extensions/ci/period "5"


values will be refreshed, at next "refresh". A refresh occurs, whenever you click on the button

## Installation

    cd ~/.local/share/gnome-shell/extensions/ && git clone git@github.com:ericaro/ci-gnome-shell-extension.git ci@e.ericaro.net



## Hacking

if you edit the schema, don't forget to recompile it.

### compiling schema

      glib-compile-schemas schemas/

