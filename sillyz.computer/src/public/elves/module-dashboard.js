import module, { insights } from "@silly/tag"

const $ = module('module-dashboard', { buckets: {} })

$.draw((target) => {
  const { buckets } = $.learn()
  return JSON.stringify(buckets)
})

let offset = 5.5;
let now = Date.now() + offset * 60 * 60 * 1000;
let date = new Date(now);
let minutes = date.getMinutes();
let roundedMinutes = Math.floor(minutes / 5) * 5;
date.setMinutes(roundedMinutes, 0, 0);

let timezone = Math.floor(offset) === offset ?
  "0" + offset + "00" :
  "0" + Math.floor(offset) + "30";

let dateString = date.getFullYear() + "-" +
  ("0" + (date.getMonth() + 1)).slice(-2) + "-" +
  ("0" + date.getDate()).slice(-2) + "T" +
  ("0" + date.getHours()).slice(-2) + ":" +
  ("0" + date.getMinutes()).slice(-2) + ":" +
  ("0" + date.getSeconds()).slice(-2) + "+" +
  timezone;

console.log(dateString);

function getCurrentTime() {
  const date = new Date();
  const minutes = date.getMinutes();
  const roundedMinutes = Math.floor(minutes / 5) * 5;
  date.setMinutes(roundedMinutes, 0, 0);

  return date.toISOString();
}

// Example usage in requestAnimationFrame
function animate() {
    const { buckets } = $.learn()
    const currentTime = getCurrentTime();
    const logs = insights()

    const types = Object.keys(logs)

    const bucket = types.reduce((accumulator, type) => {
      const total = logs[type]
      let known = 0


      if(!buckets[currentTime]) {
        buckets[currentTime] = {}
        $.teach({ buckets })
      }
      if(buckets[currentTime][type]) {
        known = buckets[currentTime][type]
      }

      accumulator[type] = known + (total - known)

      return accumulator
    }, {})

    // Your animation code here
    $.teach(bucket, mergeBucket(currentTime))
    // Request next animation frame
}

setInterval(animate, 100)

function mergeBucket(timestamp) {
  return (state, bucket) => {
    return {
      ...state,
      buckets: {
        ...state.buckets,
        [timestamp]: {
          ...state.buckets[timestamp],
          ...bucket
        }
      }
    } 
  }
}
