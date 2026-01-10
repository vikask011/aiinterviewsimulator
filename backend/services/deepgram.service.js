import axios from "axios";


export const textToSpeech = async (text) => {
  const response = await axios.post(
    "https://api.deepgram.com/v1/speak?model=aura-asteria-en",
    { text },
    {
      headers: {
        Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
        "Content-Type": "application/json",
      },
      responseType: "arraybuffer",
    }
  );

  return response.data; // audio buffer
};

export const speechToText = async (audioBuffer) => {
  const response = await axios.post(
    "https://api.deepgram.com/v1/listen?model=nova-2&language=en",
    audioBuffer,
    {
      headers: {
        Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
        "Content-Type": "audio/webm",
      },
    }
  );

  return (
    response.data?.results?.channels?.[0]?.alternatives?.[0]
      ?.transcript || ""
  );
};
