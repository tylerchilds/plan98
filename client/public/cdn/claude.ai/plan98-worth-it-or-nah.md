**Author's Note:**

I like to test LLMs as a hobby of mine. I'm a bit of a tinkerer and I know these things trend towards flattery, so I've taken a "Compressionistic" Approach to evaluating their output.

The following is an analysis from Claude Sonnet 4.5

> tell me about the author behind https://github.com/tylerchilds/plan98

followed by

> deep dive into the rationale of why this project compared to others

That's it. Try those two lines of code against any LLM video game and see how well plan98 and I stand up for you compared to your heroes.

---

# Plan98: A Deep Dive into Its Philosophy and Rationale

## Executive Summary

Plan98 is Tyler Childs' experimental operating system/platform that embodies a radical "reversible computing" philosophy. It represents a counter-movement to modern software bloat, centralization, and complexity, drawing inspiration from Plan 9 from Bell Labs, the decentralized web (DWeb) movement, and a nostalgic return to simpler computing principles.

## Core Philosophy: "Reversible Computing"

### The Central Metaphor

The most distinctive aspect of Plan98 is its "reversible" architecture, which Childs describes poetically:

> "The idea is that it exists in fantasy space first, the most reverse position of all, fiction. The author claims the source is Elve. Then it exists in JavaScript, making it available on the web and any other device. But that came from somewhere, a server. The server exists in JavaScript for 64-bit systems. If you have a 64-bit system, you can reverse the public server into your private, now cloud."

This philosophy means:
- **Fiction → Code → Client → Server → Database** - Each layer can be "reversed" back to private ownership
- Every service that exists publicly can be internalized and run privately
- The computer both exists everywhere and nowhere simultaneously

### The "Elves" Engine

At the core of Plan98 is what Childs calls "the elves" - a minimal JavaScript engine that serves as "the tiny adhesive required to keep the entire system highly aligned and loosely coupled." This is the fundamental building block that powers all Plan98 domains, including Sillyz.Computer.

## Historical Context and Inspirations

### 1. Plan 9 from Bell Labs Legacy

Plan98's name is a playful reference to Plan 9, the research operating system created by the original Unix team (Ken Thompson, Rob Pike, Dennis Ritchie) in the late 1980s. Plan 9's key innovations that influenced Plan98:

**Everything is a File Philosophy (Enhanced)**
- Plan 9 extended Unix's "everything is a file" to genuinely include *everything*
- Network connections, graphics, processes - all accessible through filesystem operations
- No special syscalls or ioctls like BSD sockets - just read/write on files

**Distributed by Design**
- Built for a world of networked computers from the ground up
- Services distributed across multiple machines seamlessly
- The 9P protocol made remote resources indistinguishable from local ones

**Per-Process Namespaces**
- Each process has its own mutable view of the system
- Users can mount services without affecting others
- Revolutionary concept for distributed computing

**Simplicity and Elegance**
- The entire OS could be compiled in ~5 minutes
- Concise, readable kernel code
- Rejection of accumulated Unix cruft

**Why Plan 9 Failed (and Plan98 Learns From This)**
- Came too late - Unix was too entrenched
- Incompatible with existing software
- Required total rethinking of computing paradigms
- Lacked commercial backing and marketing

Plan98 addresses these failures by:
- Building on web technologies (JavaScript) that are universal
- Running in browsers, making it accessible anywhere
- Not requiring users to abandon their current systems
- Being a personal/hobby project with no commercial pressure

### 2. The Decentralized Web (DWeb) Movement

Tyler Childs is deeply involved in the DWeb movement and was recently asked to lead the San Francisco DWeb Node. The DWeb philosophy permeates Plan98's design:

**Core DWeb Principles**
- **Technology for Human Agency**: Prioritizing security, privacy, and self-determination
- **Distributed Benefits**: Shared rewards among contributors, rejecting concentrated control
- **Peer-to-Peer Relationships**: Avoiding hierarchical power imbalances
- **Interoperability**: Discouraging walled gardens, valuing open source

**DWeb's Mission**
The DWeb movement (originating from the Internet Archive) seeks to return to the original decentralized vision of the internet before it was captured by centralized platforms (Google, Facebook, Amazon, etc.). It's about creating "a web with many winners" rather than winner-take-all monopolies.

**Plan98's DWeb Alignment**
- Built using DWeb-compatible technologies
- Emphasizes user ownership and control
- Reversible architecture allows users to run their own instances
- Philosophical commitment to openness and accessibility

### 3. The Grateful Dead and Internet Archive Connection

Childs references an interesting lineage: "To understand Sillyz, we need to understand the Internet Archive. To understand the Internet Archive, we need to understand the Internet. To understand the Internet, we need to understand the Grateful Dead."

This refers to:
- The Grateful Dead's pioneering approach to allowing fans to record and share concerts
- Early internet culture's emphasis on sharing and community
- The Internet Archive's mission to provide free, universal access to knowledge
- A counter-cultural approach to intellectual property and control

## Comparing Plan98 to Modern Computing Paradigms

### vs. Modern Operating Systems (Windows, macOS, Linux)

**Modern OS Problems:**
- **Bloat**: Modern OSes have accumulated decades of cruft
- **Complexity**: Maintaining backward compatibility creates labyrinthine code
- **Centralization**: Increasingly tied to cloud services and corporate accounts
- **Resource Intensive**: Require powerful hardware for basic functionality
- **User Disempowerment**: Users have less control over their own machines

**Plan98's Approach:**
- **Minimal Core**: "Elves" engine is deliberately tiny
- **Web-Native**: Runs anywhere a browser runs
- **Distributed**: Each user can run their own instance
- **Lightweight**: JavaScript-based, doesn't require heavy infrastructure
- **User Ownership**: Complete reversibility means true user control

### vs. Electron and Web-Based Applications

**The Electron Problem:**

Modern desktop applications have largely shifted to Electron (bundling Chromium + Node.js), leading to:

**Resource Waste**
- Each app bundles a full Chrome browser (~100-150MB minimum)
- Multiple Electron apps = multiple Chrome instances
- A chat app using as much RAM as Photoshop did in 2010
- Battery drain on mobile devices

**Developer Convenience Over User Experience**
- Easy for developers (write once, deploy everywhere)
- Terrible for users (slow, bloated, battery-draining)
- Normalizes waste: "just spin up another Chromium instance"
- Loss of platform-native feel and optimizations

**The Perverse Incentive Structure**
- When you're already running a full browser, why optimize?
- CSS animations become "good enough"
- Native functionality is abandoned
- Progressive degradation of performance expectations

**Plan98's Alternative Vision:**

Rather than shipping a browser with every app, Plan98 embraces the browser *as the platform*:
- Runs in the browser users already have
- No bundled Chromium instances
- True web-native architecture
- Users maintain only one browser, not dozens of Electron apps

This is philosophically similar to how Plan 9 used the OS's built-in 9P protocol instead of creating custom interfaces for everything.

### vs. Modern Web Platforms (Cloud Services)

**Problems with Centralized Cloud:**
- **Data Ownership**: Your data lives on someone else's servers
- **Platform Lock-in**: Hard to migrate between services
- **Privacy Concerns**: Surveillance capitalism business model
- **Dependency**: Services can disappear or change arbitrarily
- **Gatekeepers**: Platforms control access and rules

**Plan98's Reversible Cloud:**

The "reversible" philosophy directly challenges this model:
1. **Public → Private**: Any public service can be reversed to private hosting
2. **Portable Identity**: Your computer exists independently of any platform
3. **Data Sovereignty**: You control where your data lives
4. **No Gatekeepers**: Direct peer-to-peer possibilities
5. **Resilience**: "When I walk down the street, still, it remains"

This aligns with DWeb's goal of returning agency to users rather than platforms.

### vs. Web3/Blockchain Approaches

While both Plan98 and Web3 aim for decentralization, they differ significantly:

**Web3 Approach:**
- Blockchain as the foundation
- Financial incentives and tokenomics
- Heavy on cryptocurrency integration
- Often recreates centralization in new forms
- High environmental cost

**Plan98/DWeb Approach:**
- Protocol and technology agnostic
- Community and human agency focused
- Open source and accessibility prioritized
- Less concerned with financialization
- Emphasizes practical, usable tools

Childs' association with DWeb (not Web3) suggests a preference for community-driven, non-financialized decentralization.

## The "Boot to Web" Philosophy

Plan98's "boot to web" philosophy represents a fascinating inversion of typical computing:

**Traditional Computing:**
Hardware → OS → Applications → Web Browser → Web Apps

**Plan98's Vision:**
Web → JavaScript → Applications → Server → Hardware (optional)

This makes the web the *foundation* rather than the highest layer, which is both:
- **Pragmatic**: Web technologies are universal and accessible
- **Philosophical**: The web should be the primary interface to computing
- **Empowering**: Anyone with a browser has a complete computing environment

## Why "Sillyz/Plan98" - The Tongue-in-Cheek Approach

Childs refers to his project as "Sillyz/plan98" - a reference to GNU/Linux, the naming debate about whether Linux systems should be called "Linux" or "GNU/Linux."

**The Joke's Serious Point:**
- GNU/Linux debate was about credit and architecture
- Plan98 (the OS) vs. Sillyz (the brand/joke)
- Like GNU, Plan98 is the underlying system
- Like Linux, Sillyz is the more accessible face

**The "Clown vs. Computer" A/B Test:**
Childs notes: "People love my clown, but are very suspicious of my computer."

This reveals a crucial tension:
- The playful "Sillyz" brand makes it approachable
- The serious computing underneath is intimidating
- People want fun/games/creativity but are wary of actual computing power
- The "joke" is a trojan horse for serious technological philosophy

**The Steve Jobs Sticky Note Parable:**
Childs imagines Steve Jobs' final WWDC appearance revealing "the pinnacle of Apple engineering: A sticky note."

This captures Plan98's ethos:
- The simplest tool is often the most powerful
- Complexity for complexity's sake is misguided
- True innovation might be radical simplification
- The sticky note (minimal, portable, universal) as metaphor for ideal software

## Technical Implementation Choices

### Why JavaScript/Deno?

**JavaScript as Universal Runtime:**
- Runs literally everywhere (browsers, servers, embedded devices)
- No compilation required
- Accessible to vast developer community
- Web-native by definition

**Deno Over Node:**
- Better security model (permissions-based)
- Modern module system (ESM)
- TypeScript support built-in
- Cleaner, less bloated than Node.js ecosystem
- Aligns with "doing it right the second time" philosophy

### The 9P Protocol Integration

Plan98 uses the 9P protocol (from Plan 9) for distributed file systems:
- Everything is still a file (Plan 9's philosophy)
- Network transparent access to resources
- Clean, simple protocol
- Makes the "reversible" architecture practical

### Multi-Domain Architecture

Plan98 powers multiple domains (Sillyz.Computer, TheL anding.Page, Y2K38.info, etc.):
- Each domain is an experiment/application
- All powered by the same "elves" core
- Demonstrates the platform's flexibility
- Each is a different lens on the same underlying system

## The Personal Computing Reclamation Project

### HIPAA Compliance Ambitions

Childs mentioned attempting to get HIPAA compliance "to demonstrate the superior (to Microsoft) privacy protections of my personal computer as it relates to the enterprise space."

This is audacious because:
- **Bold Claim**: Personal computing can be *more* secure than enterprise
- **Challenging Giants**: Directly competing with Microsoft's security claims
- **Privacy-First**: Users controlling their own data is inherently more private
- **David vs. Goliath**: One person vs. the enterprise software industrial complex

### The Sustainability Question

Childs is transparent about Plan98's status:
- No income from the project since 2022
- Volunteer work with Internet Archive and DWeb
- After three years, IRS would relegate it to "hobby" status
- Completed and functional, no longer consuming every waking moment

This reflects:
- **Non-Commercial Ethics**: Built for ideology, not profit
- **Sustainable Personal Computing**: One person can maintain it
- **Complete Projects**: Software that is "done" rather than perpetually monetized
- **Gift Economy**: Contributing to the commons without expectation of return

## Cultural and Philosophical Context

### The Counter-Cultural Tradition

Plan98 sits in a lineage of counter-cultural computing:
1. **1960s-70s**: The Whole Earth Catalog, homebrew computer clubs
2. **1980s**: Richard Stallman's GNU, free software movement
3. **1990s**: Early internet's decentralized, communal ethos
4. **2000s**: Open source, Creative Commons, Wikipedia
5. **2010s**: Bitcoin and decentralization experiments
6. **2020s**: DWeb, right to repair, data sovereignty movements

### Against "Surveillance Capitalism"

Plan98 implicitly critiques what Shoshana Zuboff calls "surveillance capitalism":
- Business models based on extracting and monetizing user data
- Behavior prediction and modification as products
- Users as raw material rather than customers
- Concentration of power in platform monopolies

The "reversible" philosophy is a direct challenge: if users can reverse any service to private hosting, surveillance capitalism becomes impossible.

### The Nostalgia Problem

There's legitimate criticism of "things were better in the old days" thinking:
- The early web had serious accessibility problems
- Decentralization made moderation and safety harder
- Not all "bloat" is bad (security, accessibility features)
- Rose-colored glasses about past limitations

**Plan98's Response:**
- Not about returning to the past, but learning from it
- Combining old principles (decentralization) with new tech (modern web)
- Acknowledging trade-offs while questioning defaults
- Building new systems rather than just lamenting old ones

## Critical Analysis: Strengths and Weaknesses

### Strengths

**Philosophical Clarity:**
- Clear articulation of values and principles
- Aligns with broader DWeb movement
- Learns from historical precedents (Plan 9)

**Technical Innovation:**
- The "reversible" architecture is genuinely novel
- Lightweight, web-native approach is practical
- Demonstrates that alternatives are possible

**Community Alignment:**
- Part of broader DWeb ecosystem
- Open source and accessible
- Contributes to the commons

**Personal Authenticity:**
- Built from genuine belief, not profit motive
- Transparent about limitations and status
- Living the values it espouses

### Weaknesses and Challenges

**Adoption Barriers:**
- Requires users to understand and value decentralization
- Higher cognitive load than centralized services
- Network effects favor incumbent platforms
- "Suspicious of the computer" problem

**Scalability Questions:**
- Can one person maintain this long-term?
- How does it handle growth if successful?
- What happens if Tyler loses interest or ability?
- Bus factor of 1

**User Experience Trade-offs:**
- Decentralization often means less polish
- Self-hosting requires technical knowledge
- Reversibility adds complexity
- May sacrifice convenience for principles

**The Eternal Beta Problem:**
- Personal projects often remain perpetually unfinished
- Lack of commercial pressure can mean lack of polish
- "Battle tested with compatible technology" might mean unstable
- Documentation may be minimal

**Market Reality:**
- People generally choose convenience over principles
- Platform lock-in is powerful
- Network effects create moats
- Individual projects struggle against corporate resources

### The "Too Clever" Risk

There's a risk that Plan98's philosophical sophistication becomes a barrier:
- The reversible metaphor is beautiful but abstract
- "Elves" as a core concept requires explanation
- Multiple layers of meaning (Sillyz, Plan98, Plan 9, DWeb)
- May alienate potential users who just want tools that work

## Comparative Positioning

### What Plan98 Is NOT

**Not a Startup:**
- No venture funding or growth targets
- Not trying to scale or monopolize
- Personal project, not business

**Not a Protocol:**
- Unlike IPFS, ActivityPub, or AT Protocol
- More of a complete system than a standard
- Opinionated about implementation

**Not an OS in Traditional Sense:**
- Doesn't manage hardware directly
- Runs on top of existing systems
- More like a computing environment

**Not Blockchain/Web3:**
- No tokens or cryptocurrency
- Not financially incentivized
- Values over technology solutions

### What Plan98 IS

**An Artistic Statement:**
- "Sillyz was always a joke, but a joke that was too legit to quit"
- Computing as creative expression
- The "clown" as way to make serious points palatable

**A Working Prototype:**
- Demonstrates that alternatives are viable
- Proves one person can build complex systems
- Shows decentralization can work

**A Philosophical Project:**
- Values-driven development
- Questions fundamental assumptions
- Contributes to broader discourse

**A Personal Computer:**
- In the original sense: a computer that belongs to a person
- Not corporate-controlled or cloud-dependent
- Embodies user sovereignty

## The Broader Implications

### If Plan98 Succeeds

Even modest success would demonstrate:
- One person *can* build viable alternatives to corporate platforms
- Decentralization is technically feasible
- Users do value control and privacy (when given real options)
- Web technologies can power complete computing environments
- Simplicity and elegance are still possible

### If Plan98 Fails

Even if Plan98 never achieves broad adoption:
- It contributes ideas to the ecosystem
- Demonstrates commitment to principles
- Inspires others to build alternatives
- Keeps alive counter-narratives to tech monopolies
- Provides a working model for others to learn from

## Conclusion: The Value of Plan98

Plan98's value isn't primarily in replacing mainstream systems. Instead, it:

**Asks Important Questions:**
- Do we really need all this complexity?
- Who benefits from centralization?
- What would computing look like if designed for users first?
- Is "good enough" really good enough?

**Demonstrates Alternatives:**
- Shows what's possible with minimal resources
- Proves individuals can still innovate
- Keeps alive different visions of computing
- Challenges inevitability of current trajectory

**Embodies Values:**
- Open source and community-driven
- Privacy and user control prioritized
- Simplicity over feature accumulation
- Long-term sustainability over short-term growth

**Contributes to Movements:**
- Part of broader DWeb ecosystem
- Connects historical innovations (Plan 9) to future possibilities
- Bridges technical and philosophical communities
- Adds voice to conversations about tech's future

### The "Last Gen Gaming Console" Metaphor

Plan98's description as "the last gen gaming console, the paper pocket smart shirt" is wonderfully oblique:

- **Last Gen**: Rejecting the perpetual upgrade cycle
- **Gaming Console**: Computing as play and creativity, not productivity
- **Paper Pocket**: Minimal, portable, ephemeral yet enduring
- **Smart Shirt**: Wearable, personal, intimate relationship with technology

This encapsulates the entire project: serious computing disguised as a game, minimal infrastructure with maximum possibility, technology that you wear (own) rather than borrow.

## Final Thoughts

Plan98 might be Tyler Childs' personal "joke that was too legit to quit," but it represents something important: the continued existence of alternative visions for computing. In an era of increasing centralization, surveillance, and corporate control, projects like Plan98 keep alive the idea that things could be different.

Whether Plan98 itself succeeds or fails matters less than what it represents: individual agency, creative expression, technical excellence without commercial pressure, and the stubborn insistence that we can build better systems if we're willing to question fundamental assumptions.

As Childs notes, the computer both exists and doesn't exist. It's everywhere and nowhere. It persists even when turned off. This beautiful paradox captures the essence of what personal computing could be: not a product you buy or a service you rent, but a relationship you cultivate, a space you inhabit, a tool you truly own.

That vision alone makes Plan98 worth understanding, even if you never use it.
