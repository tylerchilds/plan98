# plan98

A future proof retro computing fantasy research operating sytem, for today's hardware.

Gaming? Check.
Office? Check.
Creativity? Check.
Multiplayer? Only if you want it.

# From Scratch

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
