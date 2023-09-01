# plan98

[Valerie Landau asked Douglas Engelbart](https://www.smithsonianmag.com/innovation/douglas-engelbart-invented-future-180967498 ) in 2006 how much of his vision had been achieved, Engelbart answered, “About 2.8 percent.”

plan98 is an operating system to hit the other 97.2%, rounded up.

## roadmap

The perspective of my solution is geared towards user experience. The utiliities used are from the research group https://braid.org I participate in. The 'module' library is primarily my focus in particular. This solution highlights the ability to collapse complexity across the application stack by orienting complexity into the hyper text layers, namely the markup language and the transfer protocol.

Primary Prompt Objectives

* implemented
  * change the current working directory
  * current working directory
  * get directory contents
  * get file contents
  * write file contents
* partially implemented
  * move a file/directory
  * create a new file/directory
* not implemented
  * file a file

Extension Objectives

* implemented
  * braid local storage
* partially implemented
  * braid remote storage

## development

```
npm run build && npm start
```

[http://localhost:3000](http://localhost:3000)
