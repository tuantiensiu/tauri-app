importScripts("./custom.js");
self.addEventListener("install", function (event) {
  // only happens once for this version of the service worker
  // wait until the install event has resolved
  console.log("loading service worker");
  event.waitUntil(
    // then create our named cached
    caches
      .open("sw-cache-v1")
      .then(function (cache) {
        // once created, lets add some local resouces
        console.log("loading service worker");
        return cache.addAll(["./index.html"]);
      })
      .then(function () {
        console.log("Service worker is ready, and assets are cached");
      })
  );
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker activating", event);
});

self.addEventListener("fetch", function (event) {
  // console.log("Service Worker fetching.", event);
  // If the request in GET, let the network handle things,
  if (event.request.method !== "GET") {
    return;
  }
  //   here we block the request and handle it our selves
  event.respondWith(
    // console.log('Service Worker fetching. \n', event.request.url, response)
    // Returns a promise of the cache entry that matches the request
    caches.match(event.request).then(function (response) {
      // here we can hanlde the request how ever we want.
      // We can reutrn the cache right away if it exisit,
      // or go to network to fetch it.
      // There are more intricate examples below.
      // https://ponyfoo.com/articles/progressive-networking-serviceworker
      if (response) {
        // our responce is in the cache, let's return that instead
        console.log("response in cache", response);
        return response;
      }
      // if the responce is not in the cache, let's fetch it
      return fetch(event.request)
        .then(async function (response) {
          // descript key.vgmk && secret code
          if (response.url.includes("key.vgmk")) {
            let clone = response.clone();
            // descript with javascript
            // let xor = function (a, b, isLooping) {
            //     if (isLooping === void 0) { isLooping = false; }
            //     var length = isLooping ? b.length : a.length;
            //     var result = new Uint8Array(length);
            //     for (var i = 0; i < length; i++) {
            //         var j = isLooping ? i % a.length : i;
            //         result[i] = a[j] ^ b[i];
            //     }
            //     return result;
            // }
            try {
              const keyBuff = await clone.arrayBuffer().then(function (ab) {
                return new Uint8Array(ab);
              });
              const path = clone.url.replace("key.vgmk", "");
              const quality = ["360p", "480p", "720p", "240p", "1080p"];
              let newBlob;
              for (let i = 0; i < quality.length; i++) {
                newBlob = await fetch(`${path}${quality[i]}.m3u8`);
                if (newBlob.ok) break;
              }
              const IV = await newBlob.text().then(function (str) {
                return str
                  .match(/(IV=0x).+/)
                  .toString()
                  .replace("IV=0x", "")
                  .slice(0, 4);
              });

              // const newBuff = await xor(keyBuff, IV, false);
              // // console.log(`original Key: ${keyBuff}`, `secretCode: ${IV}`, `new Key: ${newBuff}`);
              // // return modified response => newBuff
              // const reverseBuff = await xor(newBuff, IV, false);

              // decrypt with wasm
              await wasm_bindgen("./custom.wasm");
              const newBuff = wasm_bindgen.decrypt(keyBuff, IV, false);
              // console.log(newBuff);

              // const reverseBuff = wasm_bindgen.decrypt(newBuff, IV, false);

              return new Response(newBuff, clone);
            } catch (error) {
              console.log("response error", error);
              return response;
            }
          }
          // we have a responce from the network
          return response;
        })
        .catch(function (error) {
          // Something happened
          console.error("Fetching failed:", error);
          throw error;
        });
    })
  );
});
