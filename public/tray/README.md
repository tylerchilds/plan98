## Process

### First Steps

I began my process by examining the two options and I settled on the infinitely scrolling message list. The performance aspect of this exercise is what interested me the most, since it needs to work well with many items loaded on mobile.

I made a short list in my head of what I'd need to do to solve the problem.

1. Document my Process
2. Host the solution, password protect it and shorten the url
3. Work the actual problem

First I started this document, since I'd need to keep an accurate and detailed record throughout this process. I also initialized a local git repository.

Next, I wanted to take clear up the logistical problems of hosting and password protecting the site. I find getting development to match production as quickly as possible clears up problems with deployments that might crop up later on.

To start, I found a quick example of a basic Ruby server with HTTP Basic Authentication using the `rack` gem. After this, I created a simple `index.html` with some text and I pushed it up to Heroku. I chose Heroku since it's easy to quickly deploy a simple site for free. Typically I use GitHub Pages for simple static hosting, but that didn't fit into the requirements of this project.

Shortening the URL is really straight forward and the demo is available here: https://goo.gl/CLO2al

### Solving the Problem

Now that the first two steps of the short list are complete, it's time to explode step 3 into what is remaining.

1. Create the overall HTML with an element to append messages
2. Set up an HTTP request to hit the messages endpoint
3. Create nodes for each message in the response and append them
4. Handle errors from the HTTP request
5. Style everything
6. Add swipe event/gesture
7. Detect when the user has scrolled far enough and we should fetch more messages
8. Add a zero state for when the page first loads and we don't have messages yet
9. Optimize for performance

Step 9 will prove to be the most interesting because I'm not sure right away what the best approach will be. I know the problem is going to be related to the number of DOM nodes from all the messages. I'm not sure if it's going to be the browser handling the actual nodes in the document or if it has to do with actually rendering them to the page. I think it will be a problem with rendering them.

I'll find out more when I get to this step, but these are a couple things I'm keeping in mind from the outset.

1. Check how well the initial code is performing. I'll check to see how many messages it takes before the UI becomes slow. This will give me a good baseline to improve upon.
2. For messages that are outside of the viewport, I can set visibility to hidden. This will keep them in the document flow, won't trigger a reflow and won't mess with the scrolling like using `display: none;` would do to the document's height.
3. If needed, we can remove elements from the document that are no longer in the viewport. This part would be tricky to do to not mess with the scrolling and to be able to add messages back in if the user scrolls up.

At this point, it's time to start tackling the list with some code.

#### Creating the html

The HTML required is pretty straight forward. A header, a message section and a progress section that will serve as our zero state and if the user gets to the bottom of the page. The mockup doesn't have a loading indicator, but I recognize the Material Design nature of the mock up, so I'll be able to find a loading indicator that will match the mockup.

#### Requesting Messages

To build this, we'll want to build a `fetchMessages` function that will request the messages endpoint and take an optional pageToken argument. We'll need to consider where the current pageToken is stored as well. At this point, I think the best course of action is to build a MessagesList class and a class method to fetch the messages. I'll also be able to store the pageToken on the instance of MessagesList to keep track of the next call for more messages.

After getting the basic `fetchMessages` function working to call the API, I realized that the default limit is 10. I feel like this is a bit too small, so I'm going to make the MessagesList class take a limit as an argument that will be used on all requests.

Looking at a message item from the response, I notice that the author's image url is relative. To be able to use the same URL for the message fetch requests and photo requests, I'm going to make the url an option. Instead of MessageList now taking `limit` and `url` as an argument, it'll take an object that will have `limit` and `url` properties.

Since the pageToken is also stored on the instance, I'm going to remove it from the `fetchMessages` argument list. This will make it so when we fetch messages we don't need to pass an argument that the object already has access to.

#### Building List items

Now that we've made our first request, it's time to insert the messages into the DOM.

Looking at the designs, we'll need to add the user's image, their name, how long ago they posted and the message. This calls for building a Message class that will take this information into the constructor and build an element.

After starting the message class, I noticed I was going to be creating a lot of elements. I wrote an Element class for creating elements, applying attributes to them and changing classes. I also noticed the Message class was trying to do a lot, so I created a Meta class that creates the elements for the photo, name and timestamp.

Originally for the timestamp, I was going to write a function that would say how long ago the message was because the mockups have times listed as "12 minutes ago" and "4 hours ago", but all the messages are at least a year old. So I've settled on just simply formatting the date to "Month Day, Year" and using an array to look up month names.

#### Handle Request errors

If there's an error when fetching more messages, we'll want to handle it gracefully. Looking to Material Design, it looks like a snackbar error with the ability to retry is on brand and will provide the user with recourse and still allow them to interact with what has already been loaded.

To do this, I'm going to build a Snackbar class that will take an element to attach to. I'll also be able to use the snackbar later to undo messages, which might be outside of the scope of this exercise, but is good to plan for anyhow. The snackbar will have two methods: show and hide. Arguments will be for the error text, link text, and a function for the link action.

The Snackbar will be a singleton that attaches to the element with snackbar id, since we'll only want one snackbar per page.

If there is an error in the HTTP request, we'll call the snackbar's show function. The `fetchMessages` function of the instance will be bound and passed to the snackbar to be called when the user initiates a retry of the request.

#### Style everything

Now that all the components are rendered to the DOM, it's time to style them.

I start out by opening the files in photoshop so that I can get the exact sizes and colors from the mockups. The font is Roboto with two weights: normal (400) and medium (500). I include Roboto from Google Fonts. The header and cards have box shadows, with the header having the longer shadow. The base font size is 14px with a line height of 20px;

The photo is 40px by 40px. The cards have padding of 16px inside and a margin of 8px below. The container the cards are in has a padding of 16px. Because of this, I'm going to add a class to the messages element to add this padding.

The user's name is medium, with a slightly larger line height than the timestamp. The timestamp font size is 12px. To match the design's spacing, I make the line height for the name 22px and the timestamp 18px. The reason for doing this is to match the 40px height of the image. I also notice the timestamp is a little bit lighter in color; according to Material Design, dark text on a light background should be 87% opacity for primary copy and 54% opacity for secondary copy.

For the header, I know that I am able to get the menu icon from the material design icons. Since it needs to be fixed to the top, I'll need to add padding to the body equal to the height of the header so that the first message isn't partially covered before the user scrolls.

In addition to what's in the mockups, I'm also styling a Snackbar to handle errors from the HTTP request to allow the user to retry the request. I can also use the Snackbar if I implement an undo feature of dismissing the cards.

#### Swipe Gesture

I studied how Google Now handles cards. I noticed as you are dragging, the opacity decreases in addition to the card moving off the screen. After the card moves off the screen, the cards below it slide up. To handle this, I decided it would be best to use CSS animations. First, slide the card off screen and fade it out. After this, animate the properties that control the space the card takes up, including margin and padding.

For the gestures themselves, we can use touchstart, touchmove, and touchend. When the user first touches, we store the start time and start x position. As the user moves, we can determine whether they are swiping left or right by subtracting the new position from the first position. Using this new offset, we can calculate how much to fade the card out as the user is dragging and how far to slide the card.

When the user is finished swiping and the touch end event fires, we can check the thresholds to see if the user has swiped far enough across the screen or close enough to one of the edges. If the user drags for long enough, we can also increase the threshold for distance they need to swipe. If the swipe meets the threshold, the class to remove the card will be added. If it doesn't, the class to reset the card will be added.

If the card gets removed, we can call the parent with a method to be able to recover the card. This will add the class with the transitions to animate the card back to its initial state. The parent will then show the snackbar with an action to undo the removal. If the user hits undo, then the snackbar will also go away.

One thing I noticed was that as you would scroll, the cards would wiggle. To avoid this state, I added detection to the first touchmove event to determine if the event was a swipe or a scroll. If it's a scroll, the cards will not be swipe-able. If it's a swipe, the page won't scroll until the gesture is finished.

#### Infinite Scroll

I added a simple scroll event listener on the window in the message list to detect when the user scrolls. If they scroll to be within one screen distance from the bottom of the list, it will call `fetchMessages` . Since the scroll event fires on every scroll movement, we don't want to call the endpoint more than once per token, unless the request fails.
I added a boolean to the `MessageList` that will track if the instance is fetching. This gets set to true when `fetchMessages` is called and false on a successful request. If the request failed, the Snackbar appears with the ability to retry the request. At this point, the scroll will no longer fetch messages until the user manually retries, which would get them back to a normal state on success.

#### Zero state

For when the user first lands on the page, we needed to add a loader to indicate to the user that something was happening. This loader will remain on the page even after messages are fetched, but below the message list. Ideally, the user will never see this animation again, but it's there in case they hit the bottom of the page.

To do this, I just found an svg and some CSS that emulate material design. I didn't write this from scratch, since it's just a bonus to add into this exercise. This is the codepen that I modified to get the desired indefinite circular progress indicator: http://codepen.io/jczimm/pen/vEBpoL.

#### Optimization

Right out of the gate the user interface on mobile is slowed with too many messages, which was anticipated. This is particularly noticeable when swiping cards.

After getting this benchmark I set out to try my first theory of setting visibility: hidden to elements outside of the viewport. To do this, I just check that each of the children are within range of the viewport. I defined this range as 2 viewports above and below the current viewport. I created a `handleVisibility` function that I call inside the scroll listener, when messages are retrieved, and when messages are removed.

This ended up working better than I had anticipated and the cards were able to slide smoothly even on my old phone with many messages populated.

Next up, we can optimize how often visibility gets calculated. Currently the calculation isn't throttled at all, so it fires for every tiny movement scroll. We can set this up to only call at most every 200ms, which should be more than enough time, even if the user scrolls fast enough to hit a section of the page that has messages currently hidden.

#### Refactoring

I noticed the MessageList class was getting pretty large, so I considered what I could break out to make more modular and easier to maintain. It was pretty clear the logic for the infinite scrolling would be a great candidate, so I decided to make an InfiniteList class with the logic for the infinite scrolling and I made MessageList inherit from it.

#### Future Refactoring

Given more time to continue working on optimizing this as much as possible, it would make sense to create a Card class that Message can inherit from since Message is essentially just a special card right now. Along the same line, MessageList could be a CardCollection and we could break out the logic specific to maintaining the collection of cards into this new class. In a production environment, I wouldn't have the excess HTTP requests for all of the CSS files and JS files. I'd compile them into a uglified and compressed files. I'd also utilize a compiler, such as babel, to utilize ES6 and to compile it down to ES5 to be compatible across browsers.

As it stands now, I'm happy with this solution and I view it as complete for this exercise even though there are always ways to further refine.
