## Getting Started

Register as a developer on the Admin Panel(https://digilockbox.com/admin).

On the admin panel, register an email address. You will be asked to set security questions and an optional passphrase and select Developer as an account role. After registering as a developer on Bayun, you can create an application in the developer console. You need to provide your App name. 

We provide you with an Application Id, Application Salt, Application Secret and BaseURL when your app is registered with Bayun.

The BaseURL, Application Id, Application Salt, and Application Secret will be needed along with the other authentication information when you authenticate with Bayun's Lockbox Management Server to use Bayun features.

These should be kept secure. You MUST register every new app with Bayun, and use a different Application Id, Application Salt, and Application Secret for every app. Otherwise, the data security of your apps will potentially be compromised, and the admin-panel functionality of different apps (used as a dashboard by enterprise admins for control and visibility) is also likely to get mixed up.


## Bayun JavaScript SDK Documentation

Check out [Developer Guide](https://bayun.gitbook.io/bayuncoresdk-javascript-programming-guide/).

## Testing JavaScript with test.html

Update the app credentials in test.js.
Run the test.html using a live/local server.
