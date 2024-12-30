export const getBlobUrl = async (
    playUrl: string
  ) => {
   try {
    console.log("playUrl videos stream", playUrl);
    const baseUrl = playUrl.substring(0, playUrl.lastIndexOf('/'));
    console.log("baseUrl", baseUrl);
    
    
   } catch (error) {
        console.error("Error fetching video", error);
   }
  };