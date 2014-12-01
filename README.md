# CI gnome shell extension

This is a small, simple extension to display a CI daemon status.

## Usage

 - green smiling emoticon: CI is ok
 - red sad emoticon: CI has errors
 - zzz smiley: protocol error: outgoing (`->`) , or incoming( `<-`), or json (`{}` 

Changing the remote server:

      dconf write /net/ericaro/ci/url "'http://localhost:8080/status'"