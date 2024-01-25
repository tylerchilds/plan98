# JavaScript Operating System - os.js.org

For write once run on any thing. [Try it now.](https://sillyz.computer)

## Why a JavaScript Operating System

Building for distributed-systems historically has relied on cross-platform architectures and compilation.

People that build and buy digital goods do not like or care about any of those words, but pay to save time and money.

Whether you're dabbling with technology for the first time or shipping international enterprise products, same, same.

### Portable.

Whether you're flash drive hopping, dual booting, or embedding, the architecture is flexible.

Start from scratch

### Consistent.

Leveraging modern approaches, all existing web content is backwards compatible.

Start right now

### Customizable.

Match your phone with your slides every costume change, for every performance and pitch.

Change theme

### Innovative.

Five action words connect script to screen, pitch to play in a module: learn to draw in style when you teach.

Create a scene

### Compatible.

Populate windows with any networked data source or be offline and local only.

Go Enterprise or Community

### Collapsible.

In the event of computing collapse, the source code serves as a contract with our new overlords, should we be able to negotiate.

Print Source Code Now

## From Scratch

First, we need to create a new computer with a literal and metaphorical thumb drive.

Unless you already have a folder named `thumb-drive` in your home directory, rust+cargo, and deno installed, run:

```
deno task provision
```

Then, we're ready to start the services.

```
deno task start
```

That's it.

## There is more though

Check out deno.json to modify under the hood or maybe mod.js to be in the driver seat for climate control.

These internals do assume there are corresponding ssh user keys for the reverse services to bind correctly.

### Default Boot Services

These are the default services at boot:

```
start-client
start-server
```

To start the web server, sandboxed by deno, run:
```
deno task start-client
```

To start a private 9p server for the source code of the web server, run:
```
deno task start-server
```

### Optional Boot Services

```
reverse-client
reverse-server
```
To serve public dns traffic on the newly started web server, run:
```
deno task reverse-client
```

To serve the private 9p server over public dns, run:
```
deno task reverse-server
```

### You mentioned hardware?

To serve a metaphorical thumb drive named literal thumb-drive that should virtually mount where your physical thumb drives mount in your digital file system module, run:

```
deno task thumb-drive
```

Any hardware capable of running the light-weight 9p utilities will be able to access the onboard 9p system or any 9p compliant peer in the network.

To unplug the drive, run `deno task unthumb-drive`.

## Unified Prototyping, Development and Deployment

Run:

```
deno task start
```

And if that sounds like a problem waiting to happen when it comes to debugging, you're right.

In that scenario, [https://docs.deno.com/runtime/manual/basics/debugging_your_code](learn a little about debugging), then run run:

```
deno task debug-client
```

### examples in the wild, (add yours!!!)
[https://thelanding.page](https://thelanding.page)
[https://y2k38.info](https://y2k38.info)
[https://css.ceo](https://css.ceo)
[https://ncity.executiontime.pub](https://ncity.executiontime.pub)
[https://yourlovedones.online](https://yourlovedones.online)
[https://1998.social](https://1998.social)
[https://sillyz.computer](https://sillyz.computer)
[https://local.tychi.me](https://local.tychi.me)
[http://localhost:8000](http://localhost:8000)

Sincerely yours,
The Notorious Sillonious.

## Reverse Engineer's Reverse Roadmap

[] Don't write a game.

[x] If you do, don't write a game engine.

[x] If you do, don't write a platform.

[x] If you do, don't write a computer.

[] If you do, don't commercialize it.

[] If you do, don't teach it to kids.
