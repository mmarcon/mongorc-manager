# mongorc-manager

A simple command line utility to manage your `~/.mongorc.js`.

As I started taking advantage of `~/.mongorc.js` and adding functions and helpers I typically
use in may day to day work I found helpful to have an utility to add/remove JS files that are loaded
when the mongo shell starts up.

I have libraries here and there in my filesystem as they live in different git repos I share with
other people and having one utility that can automatically register and unregister helpers saves me
a lot of time and keeps `~/.mongorc.js` tidy.

## Usage

```bash
> #installs mongorc-manager
> npm install -g mongorc-manager
> #initializes it:
> #- backs up the existing ~/.mongorc.js and loads it from the new, managed ~/.mongorc.js
> #- lists the linked JS files (at this point only the original backed up one)
> mongorc-manager --list
> #Link new JS file
> mongorc-manager -l /path/to/file.js
> #Unlink linked JS file
> mongorc-manager -u /path/to/file.js