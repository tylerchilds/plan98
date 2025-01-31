import elf from '@silly/elf'
import { marked } from 'marked'

const $ = elf('about-sillyz')

$.draw((target) => {
  return marked(`# About Educational Technology

Computers are mysterious, complex creatures. Were they always though? Are they stuck that way forever?

From talking to parents and kids about what they love about computers, there's a reason why we can't quit them and the answer is a silly little three letter word.

**Fun.**

I'm Ty and my first computer was a Sega Genesis that I used to play Sonic the Hedgehog in the 90s. After that, I knew I was going to make video games one day.

In 2006, I learned how to create games while I was a senior in high school using Macromedia (Adobe) Flash, which was fun for a brief while until the games no longer ran on anything due to how terribly insecure the entire flash platform was-- which is why Steve Jobs never let it run on the iPhone.

After that, I began writing JavaScript, which carried me from my humble shoreline roots of Cape Cod, Massachusetts to Silicon Valley, where I worked at Netflix from 2018 to 2022.

August of 2022, I set out to build a game engine that was easy to teach, ran on systems that cost under $100, could fit in your pocket, delivered live music performances, and could serve as my personal computing device to create Silicon Valley grade solutions.

That took longer than I thought, but along the way an honest clown was made of me as the greatest role I've undertaken, the NPC, "Ty from Sillyz.Computer".

## What about the fun part?

Right. Right. In my research studies the most fruitful discussions came from these topics:

* What was your first computer?
* What do you love about computers?
* What do you hate about computers?
* What do you spend the most time doing with your computer?
* Have you tried programming? If so, what finally clicked?

I'll spare the gory details, but all the answers were highly subjective and generational.

The earlier generations said they learned to program using Basic on an Apple device or a Commodore 64.

The middle generation learned with Java, JavaScript, or Python on either the Windows PCs or Macs.

The youngest generation has mostly learned Scratch, primarily on phones or tablets.

The trendline has primarily driven towards more restrictive environments, typically for ease of access on mobile devices, which are generally more locked down, limiting the creative possibilities.

To that end, it is quite amazing what kids are able to accomplish using Scratch on a tablet-- the insecure games I used to write in Flash are now completely secure in Scratch and there's an entire underground of kids creating and sharing games.

However, the biggest question I fieled from kids and parents alike was, "How do we build products, like Netflix, using Scratch?" And the sad answer is simply, "You can't."

This became a critical pillar of Sillyz.Computer-- What is smallest API that I can design to create actual products, allowing kids to break free from the dead end platforms they've been relegated to?

My sister is 18 years younger than me, a senior in high school at the time of this writing, January 2025. Throughout her life, I've taught her computer things to varying degrees of success.

My biggest failure was in not being able to create a toy that my sister found more fascinating than Roblox. Kids have paid for their college tuition or bought their first car by creating inside the Roblox platform and getting paid in Robux.

## No really, what about the fun part?

Right! Right... While in the current form, Sillyz.Computer is more like digital lego blocks, each discrete demonstration compounds on previous demonstrations to be able to build any digital, or physical application.

While running on Sillyz.Computer proper, you won't be able to make changes to the source code, but you can read it. You may run the code locally on your computer or boot it directly onto a device-- I personally am writing write now on a [frame.work](https://frame.work).

* My home entertainment console is the [GPD Win 4](https://www.gpd.hk/gpdwin4).
* My favorite demo device is the [Raspberry Pi 500](https://www.raspberrypi.com/products/raspberry-pi-500/).
* My favorite magic trick is pulling the [Raspberry Pi 5 Compute Module](https://www.raspberrypi.com/products/compute-module-5/) from my signature sticky notes.
* For just toying around with prototypes, I enjoy the [Raspberry Pi 5](https://www.raspberrypi.com/products/raspberry-pi-5/)
* When I'm trying to get serious work done, I boot [an expensive Apple MacBook, but running Sillyz.Computer](https://asahilinux.org/)
* To get cross-platform native applications, I compile out from [Tauri.App](https://tauri.app/)

As you can see, while I might be a Jester, my technology is no joke. If you're reading this right, this platform is the most cross platform system ever devised and I nailed all the original success criteria.

1. a game engine that was easy to teach
2. ran on systems that cost under $100
3. could fit in your pocket
4. delivered live music performances
5. could serve as my personal computing device to create Silicon Valley grade solutions.

## Getting Started

There is no linear path to learning Sillyz.Computer, however, below is an attempt.

### Hello World

The default first program written in any language is called, "Hello World".

The goal of the project is render the text, Hello World to the screen.

* [Hello World: Demo](/app/hello-world)
* [Hello World: Source](/app/code-module?src=/public/elves/hello-world.js)

### Hello Nickname

After getting text rendered, the next step is getting data synchronized when it changes.

Hello Nickname is a simple program to demonstrate the concept of "Two-Way Data Binding"

* [Hello Nickname: Demo](/app/hello-nickname)
* [Hello Nickname: Source](/app/code-module?src=/public/elves/hello-nickname.js)

### About Sillyz

A little bit meta, but this is the source code for the component you're currently viewing. Don't fall in.

* [About Sillyz: Demo](/app/about-sillyz)
* [About Sillyz: Source](/app/code-module?src=/public/elves/about-sillyz.js)


### Mine Sweeper

One of the most popular games of the Windows Era was Minesweeper. This software was purchased for who knows how much, but at this point the game is often relegated to an interview question to prove you can code.

People write this program for free every day just in the hopes of landing a gig at a tech company. Trust me, I did it. That's how I made it out to California.

This is a flavor of the game, that also layers on Conways Game of Life for a pretty visualization-- also a technical interview question.

* [Minesweeper: Demo](/app/mine-sweeper)
* [Minesweeper: Source](/app/code-module?src=/public/elves/mine-sweeper.js)

### Dial Tone

Dial Tone was an intial experiment in exploring relational music space. The notes on the right increase the frequency, the left will decrease it. Change the instrument. The center instrument is the root key and can be played all day without going anywhere.

The end goal has yet to be actualized, where individuals can claim a sequence of midi tones to be rung.

* [Dial Tone: Demo](/app/dial-tone)
* [Dial Tone: Source](/app/code-module?src=/public/elves/dial-tone.js)

### Music Walk

The music walk effectively combines mine-sweeper and dial-tone, allowing for an electric violin, but only if you really know what you're doing.

* [Music Walk: Demo](/app/music-walk)
* [Music Walk: Source](/app/code-module?src=/public/elves/music-walk.js)

### Solid Todolist

Sir Tim Berners-Lee created the World Wide Web. Tim and I share a vision where individuals are in control of their Personal Online Data. Tim has created an implementation with his World Wide Web Consortium and now runs an enterprise business on his passion project, Solid-- Socially Linked Data.

Solid Todolist is an intial experiment in backing a Todo List with Tim's system.

* [Solid Todolist: Demo](/app/solid-todolist)
* [Solid Todolist: Source](/app/code-module?src=/public/elves/solid-todolist.js)

### File System

The file system component is a work in progress, but the general idea is to be able to browse a collection of files.

* [File System: Demo](/app/file-system)
* [File System: Source](/app/code-module?src=/public/elves/file-system.js)

### Generic Park

Generic Park is a spin on the visual file system as scene in the film Jurassic Park. That technology was real and it was called Irix.

Generic Park is also real and is a 3d visualization of the file-system component. You can actually reach Generic Park from within any directory in the File System, did you find out how?

* [Generic Park: Demo](/app/generic-park?src=/public/elves)
* [Generic Park: Source](/app/code-module?src=/public/elves/generic-park.js)

### Irix Launcher

Every operating system needs a top level place to start programs from. This is the launcher embedded in the bulletin board.

* [Irix Launcher: Demo](/app/irix-launcher)
* [Irix Launcher: Source](/app/code-module?src=/public/elves/irix-launcher.js)

### Bulletin Board

A re-imagination of the classic bulletin board system while spinning the more popular infinite canvas collaboration space of modern times.

* [Bulletin Board: Demo](/app/bulletin-board)
* [Bulletin Board: Source](/app/code-module?src=/public/elves/bulletin-board.js)

### Game Over

Every game needs a game over screen. This one is just weird.

* [Game Over: Demo](/app/game-over)
* [Game Over: Source](/app/code-module?src=/public/elves/game-over.js)

### Hello Bluesky

Bluesky is like Twitter (formerly X), but open. Sillyz is the everything app, sorry Elon.

You can connect to your bluesky account from here, but this demo is pretty basic beyond signing in and connecting to your feed.

* [Hello Bluesky: Demo](/app/hello-bluesky)
* [Hello Bluesky: Source](/app/code-module?src=/public/elves/hello-bluesky.js)

### Hyper Script

Back in college I needed a way to

1. Write a screenplay
2. Print it in the correct format
3. Pitch it while leaving it all on the floor.

Hyper Script is personally my goto component any time I need to flex my creative muscles as it runs primarily on humanity and humility.

* [Hyper Script: Demo](/app/hyper-script)
* [Hyper Script: Source](/app/code-module?src=/public/elves/hyper-script.js)

### Impromptu Stagehand

in an alternate reality, i ran unconferences. this was the tool i used to organize to defend against the villians that controlled the pen and paper.

* [Impromptu Stagehand: demo](/app/impromptu-stagehand)
* [Impromptu Stagehand: source](/app/code-module?src=/public/elves/impromptu-stagehand.js)

### Clown Jukebox

As a street clown, my primary role is in giving the audience what they want. This was a proof of concept I devised to let the audience disengage from reality by tripping into their phone until I learned how to read a room.

* [Clown Jukebox: demo](/app/clown-jukebox)
* [Clown Jukebox: source](/app/code-module?src=/public/elves/clown-jukebox.js)

### Just Me

A social network for just me. Go away. Sorry. Well, stay if you'd like.

* [Just Me: Demo](/app/just-me)
* [Just Me: Source](/app/code-module?src=/public/elves/just-me.js)

### Secure Authentication

A login component for connecting to an end to end secure system

* [Secure Authentication: Demo](/app/secure-authentication)
* [Secure Authentication: Source](/app/code-module?src=/public/elves/secure-authentication.js)

### Secure Mail

Email, but only when you have a JMAP compatible account and a way to provide it to the system. Experimental.

* [Secure Mail: Demo](/app/secure-mail)
* [Secure Mail: Source](/app/code-module?src=/public/elves/secure-mail.js)

### Main Quest

The Havok Physics engine is the premier game engine and has been for the past two decades. Have fun, kids.

* [Main Quest: Demo](/app/main-quest)
* [Main Quest: Source](/app/code-module?src=/public/elves/main-quest.js)

### Media Plexer

No operating system is complete without being able to display files of arbitrary types. Static media in, hyper media out.

* [Media Plexer: Demo](/app/media-plexer)
* [Media Plexer: Source](/app/code-module?src=/public/elves/media-plexer.js)

### Wallet Metamask

Wallet Metamask is a neat web3 wallet like thing. This is a way to login.

* [Wallet Metamask: Demo](/app/wallet-metamask)
* [Wallet Metamask: Source](/app/code-module?src=/public/elves/wallet-metamask.js)

### Mind Chess

Mind Chess is better without looking at the board and just doing the moves, but I'm not that hardcore.

* [Mind Chess: Demo](/app/mind-chess)
* [Mind Chess: Source](/app/code-module?src=/public/elves/mind-chess.js)

### MLB Teams

MLB Teams is an introduction to the Postgres database platform. This runs in the browser, so you don't need a command line to get started.

* [MLB Teams: Demo](/app/mlb-teams)
* [MLB Teams: Source](/app/code-module?src=/public/elves/mlb-teams.js)

### My Journal

A minimal starting point for creating a journal backed by gundb

* [My Journal: Demo](/app/my-journal)
* [My Journal: Source](/app/code-module?src=/public/elves/my-journal.js)

### Paint App

A re-write of the MS paint program by a third party, mostly just a pass-through embed.

* [Paint App: Demo](/app/paint-app)
* [Paint App: Source](/app/code-module?src=/public/elves/paint-app.js)

### Live Help

A video conferencing tool, but right here and not in an app that will spy on you, like Zoom or Skype or Teams. Is Teams just a re-brand of Skype? Whatever, this is better.

* [Live Help: Demo](/app/live-help?room=about)
* [Live Help: Source](/app/code-module?src=/public/elves/live-help.js)

### Path Finder

Path Finder is like Dungeons and Dragons, but with an open license. This is the foundation of a character sheet.

* [Path Finder: Demo](/app/path-finder)
* [Path Finder: Source](/app/code-module?src=/public/elves/path-finder.js)

### Debug Gamepads

A gamepad debugger

* [Debug Gamepads: Demo](/app/debug-gamepads)
* [Debug Gamepads: Source](/app/code-module?src=/public/elves/debug-gamepads.js)

### Pro Teleprompter

A tiny repl for being able to flip the switch from source code to running system

* [Pro Teleprompter: Demo](/app/pro-teleprompter)
* [Pro Teleprompter: Source](/app/code-module?src=/public/elves/pro-teleprompter.js)


### QR Code

A component for rendering a QR Code

* [QR Code: Demo](/app/qr-code?src=/)
* [QR Code: Source](/app/code-module?src=/public/elves/qr-code.js)

### QR Pay

A payment mechanism through a QR Code

* [QR Pay: Demo](/app/qr-pay)
* [QR Pay: Source](/app/code-module?src=/public/elves/qr-pay.js)

### Payment Dashbaord

A way to create and view pay by link invoices

* [Payment Dashboard: Demo](/app/payment-dashboard)
* [Payment Dashboard: Source](/app/code-module?src=/public/elves/payment-dashboard.js)

### Sonic Knuckles

Going full circle back to my first computer, this is that, but if you also have the legal rights and the rom, you can play it here.

* [Sonic Knuckles: Demo](/app/sonic-knuckles)
* [Sonic Knuckles: Source](/app/code-module?src=/public/elves/sonic-knuckles.js)

### Silly Wizard

A text based adventure with a time travel twist.

* [Silly Wizard: Demo](/app/silly-wizard)
* [Silly Wizard: Source](/app/code-module?src=/public/elves/silly-wizard.js)

### Sillyz Ocarina

A synthesizer based on the circle of fifths

* [Sillyz Ocarina: Demo](/app/sillyz-ocarina)
* [Sillyz Ocarina: Source](/app/code-module?src=/public/elves/sillyz-ocarina.js)

### Swipe Swipe

A generic component for a swipe based infinite grid

* [Swipe Swipe: Demo](/app/swipe-swipe)
* [Swipe Swipe: Source](/app/code-module?src=/public/elves/swipe-swipe.js)

### Public Broadcast

A channel surfer based on swipe swipe. Connect a gamepad, swipe, or use arrow keys

* [Public Broadcast: Demo](/app/public-broadcast)
* [Public Broadcast: Source](/app/code-module?src=/public/elves/public-broadcast.js)

### Vosk Browser

In browser voice regognition

* [Vosk Browser: Demo](/app/vosk-browser)
* [Vosk Browser: Source](/app/code-module?src=/public/elves/vosk-browser.js)

### App Simulator

A component for rendering components at dimensions of other devices.

* [App Simulator: Demo](/app/app-simulator?app=plan98-boxart&class=iphone)
* [App Simulator: Source](/app/code-module?src=/public/elves/app-simulator.js)

### Code Module

By now, you probably realized the source code link was a source code component and the source code component could be remixed from within itself.

If not, sorry to break it to you. If so, be careful, eh?

* [Code Module: demo](/app/clown-jukebox)
* [Code Module: source](/app/code-module?src=/public/elves/clown-jukebox.js)

## Learn to Draw in Style and When to Teach them.

The mantra for the API and SDK. There are no widgets, apps, operating systems. Everything is an elf. An elf is what runs when a computer boots.

By now you can see, mathematically, a computer can be anything. A computer program is a computer. The elves power all things, the ultimate being of all systems.

Learn to Draw in Style and When to Teach them.

Learn-- Get the latest State

Draw-- Update when State changes

Style-- Make it pretty

When-- Something happens you should do something

Teach-- Set state

That's all there is to it, you can either read code or you can't. Keep trying until you avoid the game over in this so called life.

Good luck.

[View all elves here](https://github.com/tylerchilds/plan98/tree/plan98/client/public/elves)

`)
})

$.style(`
  & {
    margin: 0 auto;
    max-width: 55ch;
    display: block;
    padding: 2rem 1rem;
  }
`)
