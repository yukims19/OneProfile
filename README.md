# OneProfile

A supercharged sleuth in your browser. Given an email or GitHub/Twitter/HackerNews username, it'll track down the social activity of a person you want to know better. Includes GitHub, YouTube, and Twitter!

## Setup a OneGraph app:

Sign up at https://www.onegraph.com, create an app, and grab its id.

Open `react_extension/src/App.js` and replace the APP_ID in there.

## Loading the Chrome extension:

### 1. Build the chrome extension folder

Run the following code in  `react_extension ` directory:

```
yarn
yarn build
```

This should generate a  `build ` directory in  `react_extension` for you.

### 2. Add extension in developer mode

a) Open the Extension Management page at chrome://extensions

b) Upload react_extension/build by clicking on the LOAD UNPACKED button. (Make sure you are in Developer mode)

c) Remember to add chrome-extension://<extension-ID> to your app's CORS origins.

## Examples

![Example results](imgs/example1.png)
![Example results](imgs/example2.png)
![Example results](imgs/example3.png)
![Example results](imgs/example4.png)
![Example results](imgs/example5.png)
