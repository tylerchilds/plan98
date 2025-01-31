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

While running on Sillyz.Computer proper, you won't be able to make changes to the source code, but you can read it. You may run the code locally on your computer or boot it directly onto a device-- I personally am writing write now on a [https://frame.work](frame.work).

* My home entertainment console is the [https://www.gpd.hk/gpdwin4](GPD Win 4). My favorite demo device is the [Raspberry Pi 500](https://www.raspberrypi.com/products/raspberry-pi-500/).
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


`)
})

$.style(`
  & {
    margin: 0 auto;
    max-width: 55ch;
    display: block;
  }
`)
