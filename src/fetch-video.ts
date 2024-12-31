// import { M3U8FileParser } from "m3u8-file-parser";

export const getBlobUrl = async (
    playUrl: string
  ) => {
   try {
    // const reader = new M3U8FileParser();
    console.log("playUrl videos stream", playUrl);
    const baseUrl = playUrl.substring(0, playUrl.lastIndexOf('/'));
    console.log("baseUrl", baseUrl);
    const fetchItems =  ['playlist.m3u8', '1080p.m3u8', '720p.m3u8', '480p.m3u8', '360p.m3u8', 'key.vgmk'];
    const fetchUrls = fetchItems.map((file) =>
      fetch(`${baseUrl}/${file}`).then(
        async (res) => res && res.status === 200 ? file === 'key.vgmk' ?
          {
            file: file,
            res: await res.arrayBuffer()
          }
          : {
            file: file,
            res: await res.text()
          } : undefined
      ).catch(err => undefined)
    );
    let m3u8List = await Promise.all(fetchUrls).then(res => res.filter(gateway => gateway));
    console.log("m3u8List::", m3u8List);
    
	

   } catch (error) {
        console.error("Error fetching video", error);
   }
  };