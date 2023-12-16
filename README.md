# plan98

A hard-web-based library.

# From Scratch

First, we need to create a new computer with a literal and metaphorical thumb drive.

```
deno task provision
```

Then, we're ready to start the services.

```
deno task start
```

That's it.

## There is more though

Check out deno.json to see under the hood or maybe mod.js to be in the driver seat for climate control.

These internals do assume there are corresponding ssh user keys for the reverse services to bind correctly.

These are the default services at boot:

```
start-client
reverse-client
start-server
reverse-server
plug-drive
```

To start the web server, sandboxed by deno, run:
```
deno task start-client
```

To serve public dns traffic on the newly started web server, run:
```
deno task reverse-client
```

To start a private 9p server for the source code of the web server, run:
```
deno task start-server
```

To serve the private 9p server over public dns, run:
```
deno task start-server
```

To serve a folder named thumb-drive with the raw source in the user's current directory, run:

```
deno task plug-drive
```

To unplug the drive, run `deno task unplug-drive`. 

(todo: fix next line)
learn how to disengage the unpfs rust-9p cargo command

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
