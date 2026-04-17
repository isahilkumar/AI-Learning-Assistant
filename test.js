const { generateHighlights } = require('./utils/gemini');

(async () => {
    try {
        const result = await generateHighlights("The quick brown fox jumps over the lazy dog. The quick brown fox jumps over the lazy dog.");
        console.log(typeof result);
        console.log(Array.isArray(result));
        console.log(result);
    } catch (e) {
        console.error(e);
    }
})();
