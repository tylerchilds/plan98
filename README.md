# The Flying Disk Format

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
