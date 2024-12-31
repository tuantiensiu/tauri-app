import  M3U8FileParser  from "m3u8-file-parser";
import { decrypt } from "vgm-decrypt";

export const getBlobUrl = async (
  playUrl: string,
  isVideo: boolean
) => {
  const baseUrl = playUrl.substring(0, playUrl.lastIndexOf('/'));
  
  const reader = new M3U8FileParser();
  const fetchItems = isVideo 
      ? ['playlist.m3u8', '1080p.m3u8', '720p.m3u8', '480p.m3u8', '360p.m3u8', 'key.vgmk'] 
      : ['128p.m3u8', 'key.vgmk'];

  const fetchUrls = fetchItems.map((file) =>
      fetch(`${baseUrl}/${file}`).then(
          async (res) => res && res.status === 200 
              ? file === 'key.vgmk'
                  ? { file: file, res: await res.arrayBuffer() }
                  : { file: file, res: await res.text() } 
              : undefined
      ).catch(err => undefined)
  );

  let m3u8List = await Promise.all(fetchUrls).then(res => res.filter(gateway => gateway));
  let playlistM3u8 = isVideo ? m3u8List.find(f => f?.file === "playlist.m3u8")?.res : "";
  const key = m3u8List.find(k => k?.file === "key.vgmk")?.res as ArrayBuffer;
  
  m3u8List = m3u8List.filter(f => f?.file !== "playlist.m3u8" && f?.file !== "key.vgmk");

  await reader.read(m3u8List[0]?.res);
  const m3u8 = await reader.getResult();
  const IV = m3u8.segments[0].key.iv.replace('0x', '').slice(0, 4);
  const modifyKey = decrypt(new Uint8Array(key), IV, false) ;
  const keyBlob = new Blob([modifyKey], { type: "application/octet-stream" });
  const keyUrl = URL.createObjectURL(keyBlob);
  const modifiedM3u8List = m3u8List.map(x => {
      const modifyM3u8 = typeof x?.res === 'string' 
          ? x.res.replace(/(\d+p\/\w+\.vgmx)/g, `${baseUrl}/$1`).replace("key.vgmk", keyUrl) 
          : '';
      const m3u8Blob = new Blob([modifyM3u8], { type: "application/x-mpegURL" });
      const m3u8Url = URL.createObjectURL(m3u8Blob);
      return {
          file: x?.file,
          url: m3u8Url
      };
  });

  if (isVideo) {
      modifiedM3u8List.forEach((f) => {
          if (typeof playlistM3u8 === 'string') {
              if (f?.file && f?.url) {
                  playlistM3u8 = playlistM3u8.replace(f.file, f.url);
              }
          }
      });
      const playlistBlob = new Blob([playlistM3u8 || ''], { type: "application/x-mpegURL" });
      const playlistUrl = URL.createObjectURL(playlistBlob);
      return playlistUrl;
  } else {
      return modifiedM3u8List[0].url;
  }
};