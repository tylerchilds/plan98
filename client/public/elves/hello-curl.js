import libcurl from "https://esm.sh/libcurl.js@0.7.4";

const { Curl } = libcurl;

const curl = new Curl();
curl.setOpt("URL", "https://example.com");
curl.setOpt("FOLLOWLOCATION", true);

curl.on("end", (statusCode, body) => {
  console.log(statusCode, body);
  curl.close();
});

curl.on("error", curl.close.bind(curl));
curl.perform();
