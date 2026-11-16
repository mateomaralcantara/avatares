export function getProviderCapabilities() {
  return {
    tts: {
      provider:
        process.env.TTS_PROVIDER ||
        "disabled",

      configured:
        Boolean(
          process.env.TTS_API_KEY,
        ),
    },

    avatar: {
      provider:
        process.env.AVATAR_PROVIDER ||
        "disabled",

      configured:
        Boolean(
          process.env.AVATAR_API_KEY,
        ),
    },
  };
}