/**
 * @jest-environment jsdom
 */

const { clipboard } = require("./main"); // Путь к вашему файлу с ClipboardTools

describe("ClipboardTools", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("copy", () => {
    beforeEach(() => {
      // Мокаем navigator.clipboard.writeText и write
      Object.assign(navigator, {
        clipboard: {
          writeText: jest.fn().mockResolvedValue(undefined),
          write: jest.fn().mockResolvedValue(undefined),
        },
      });
    });

    test("copies text via navigator.clipboard.writeText", async () => {
      const spyWriteText = jest.spyOn(navigator.clipboard, "writeText");
      await clipboard.copy("Hello World", { type: "text", showToast: false });
      expect(spyWriteText).toHaveBeenCalledWith("Hello World");
    });

    test("copies html content via navigator.clipboard.write", async () => {
      const spyWrite = jest.spyOn(navigator.clipboard, "write");
      await clipboard.copy("<b>Bold</b>", { type: "html", showToast: false });
      expect(spyWrite).toHaveBeenCalled();
      const clipboardItem = spyWrite.mock.calls[0][0][0];
      expect(clipboardItem.types).toContain("text/html");
    });

    test("fallbackCopyText is called if clipboard.writeText is missing", async () => {
      delete navigator.clipboard.writeText;
      const fallbackSpy = jest.spyOn(clipboard, "fallbackCopyText");
      await clipboard.copy("Fallback text", { showToast: false });
      expect(fallbackSpy).toHaveBeenCalledWith("Fallback text");
    });

    test("appends timestamp if appendTimestamp is true", async () => {
      const spyWriteText = jest.spyOn(navigator.clipboard, "writeText");
      await clipboard.copy("data", { appendTimestamp: true, showToast: false });
      const calledArg = spyWriteText.mock.calls[0][0];
      expect(calledArg).toMatch(/\?t=/);
    });

    test("throws error for image type copy", async () => {
      await expect(clipboard.copy("imageData", { type: "image", showToast: false })).rejects.toThrow("Image copy not implemented yet");
    });

    test("calls onSuccess and emits event on success", async () => {
      const onSuccess = jest.fn();
      const spyEmit = jest.spyOn(clipboard, "emit");
      await clipboard.copy("Hello", { onSuccess, showToast: false });
      expect(onSuccess).toHaveBeenCalled();
      expect(spyEmit).toHaveBeenCalledWith("copy", "Hello");
    });

    test("calls onError and emits event on failure", async () => {
      navigator.clipboard.writeText = jest.fn().mockRejectedValue(new Error("fail"));
      const onError = jest.fn();
      const spyEmit = jest.spyOn(clipboard, "emit");
      await clipboard.copy("fail", { onError, showToast: false });
      expect(onError).toHaveBeenCalled();
      expect(spyEmit).toHaveBeenCalledWith("copy", null, expect.any(Error));
    });
  });

  describe("paste", () => {
    test("returns pasted text", async () => {
      navigator.clipboard.readText = jest.fn().mockResolvedValue("pasted text");
      const text = await clipboard.paste();
      expect(text).toBe("pasted text");
    });

    test("returns null and logs error if paste fails", async () => {
      navigator.clipboard.readText = jest.fn().mockRejectedValue(new Error("fail"));
      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
      const text = await clipboard.paste();
      expect(text).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe("cut", () => {
    test("cuts text from input element", async () => {
      document.execCommand = jest.fn().mockReturnValue(true);
      const input = document.createElement("input");
      input.value = "cut this";
      document.body.appendChild(input);
      const result = await clipboard.cut(input);
      expect(result).toBe(true);
      document.body.removeChild(input);
    });

    test("returns false and logs error if no element provided", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
      const result = await clipboard.cut(null);
      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});